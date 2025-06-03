import sys
import json
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision.models import DenseNet121_Weights, EfficientNet_B5_Weights
from torchvision import transforms
from PIL import Image
import os

# Hybrid model definition
class HybridLungModel(nn.Module):
    def __init__(self, num_classes):
        super(HybridLungModel, self).__init__()
        self.densenet = models.densenet121(weights=DenseNet121_Weights.DEFAULT)
        self.densenet_features = self.densenet.features

        self.efficientnet = models.efficientnet_b5(weights=EfficientNet_B5_Weights.DEFAULT)
        self.efficientnet_features = self.efficientnet.features

        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        combined_features = 1024 + 2048

        self.classifier = nn.Sequential(
            nn.Linear(combined_features, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_classes),
            nn.Sigmoid()
        )

    def forward(self, x):
        densenet_feat = self.densenet_features(x)
        densenet_feat = self.pool(densenet_feat)
        densenet_feat = torch.flatten(densenet_feat, 1)

        efficientnet_feat = self.efficientnet_features(x)
        efficientnet_feat = self.pool(efficientnet_feat)
        efficientnet_feat = torch.flatten(efficientnet_feat, 1)

        combined = torch.cat((densenet_feat, efficientnet_feat), dim=1)
        return self.classifier(combined)

# Define class names (same order as during training)
class_names = ['Covid 19', 'Normal', 'Pneumonia-Bacterial', 'Pneumonia-Viral']
num_classes = len(class_names)

# Define transforms
transform = transforms.Compose([
    transforms.Resize((456, 456)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# Predict function with confidence threshold
def predict_image(image_path, model, transform, class_names, threshold=50.0):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)

    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
    outputs = outputs.cpu().numpy()[0]

    max_index = outputs.argmax()
    max_disease = class_names[max_index]
    max_score = float(outputs[max_index] * 100)

    if max_score < threshold:
        raise ValueError(f"Prediction confidence too low: {max_score:.2f}%")

    result = {
        "disease": max_disease,
        "percentage": max_score
    }

    return result

# Main script execution
if __name__ == "__main__":
    try:
        # Get image path from command-line argument
        image_path = sys.argv[1]

        # Check if the file exists
        if not os.path.exists(image_path):
            error_msg = {"error": "File not found"}
            print(json.dumps(error_msg))
            sys.exit(1)

        # Load model
        model = HybridLungModel(num_classes)
        model.load_state_dict(torch.load('lung_disease_model_state_dict.pth', map_location=torch.device('cpu')))
        model.eval()

        # Run prediction
        result = predict_image(image_path, model, transform, class_names)

        # Return result to Node.js and terminal
        output = json.dumps(result)
        print(output)
        print(output, file=sys.stderr)

    except Exception as e:
        error_msg = {"error": str(e)}
        print(json.dumps(error_msg))
        print(f"Exception occurred: {str(e)}", file=sys.stderr)
        sys.exit(1)
