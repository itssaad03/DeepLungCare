import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image

# First, recreate the exact same model architecture
class HybridLungModel(nn.Module):
    def __init__(self, num_classes):
        super(HybridLungModel, self).__init__()

        # DenseNet-121 for fast feature extraction
        self.densenet = models.densenet121(pretrained=True)
        self.densenet_features = self.densenet.features

        # EfficientNet-B5 for high accuracy
        self.efficientnet = models.efficientnet_b5(pretrained=True)
        self.efficientnet_features = self.efficientnet.features

        # Adaptive pooling
        self.pool = nn.AdaptiveAvgPool2d((1, 1))

        # Combined features dimension
        combined_features = 1024 + 2048

        # Classifier layers
        self.classifier = nn.Sequential(
            nn.Linear(combined_features, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_classes),
            nn.Sigmoid()
        )

    def forward(self, x):
        # Extract features with DenseNet-121
        densenet_feat = self.densenet_features(x)
        densenet_feat = self.pool(densenet_feat)
        densenet_feat = torch.flatten(densenet_feat, 1)

        # Extract features with EfficientNet-B5
        efficientnet_feat = self.efficientnet_features(x)
        efficientnet_feat = self.pool(efficientnet_feat)
        efficientnet_feat = torch.flatten(efficientnet_feat, 1)

        # Concatenate features
        combined = torch.cat((densenet_feat, efficientnet_feat), dim=1)
        out = self.classifier(combined)
        return out

# Instantiate model with the same number of classes as during training
num_classes = 4  # Replace with the actual number of classes you used
model = HybridLungModel(num_classes)

# Load the pretrained weights
model.load_state_dict(torch.load('lung_disease_model_state_dict.pth', map_location=torch.device('cpu')))

# Set the model to evaluation mode
model.eval()

# Define the same transforms you used during training
transform = transforms.Compose([
    transforms.Resize((456, 456)),
    transforms.Grayscale(num_output_channels=3),  # Convert grayscale to 3 channels
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# Function to predict on a new image
def predict_image(image_path, model, transform, class_names):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)

    # Load and preprocess the image
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    # Get predictions
    with torch.no_grad():
        outputs = model(image)

    # Apply threshold (e.g., 0.5) to get binary predictions
    predictions = (outputs > 0.5).float().cpu().numpy()[0]

    # Return the predicted classes
    predicted_classes = [class_names[i] for i, val in enumerate(predictions) if val == 1]
    return predicted_classes, outputs.cpu().numpy()[0]
# Define your class names (in the same order as during training)
class_names = ['Covid 19', 'Normal', 'Pneumonia-Bacterial', 'Penumonia-Viral']  # Replace with your actual classes

# Path to the image you want to classify
image_path = 'Pneumonia-Bacterial (15).jpg'  # Replace with actual path

# Get predictions
predicted_classes, class_probabilities = predict_image(image_path, model, transform, class_names)

# Print results
print(f"Predicted conditions: {predicted_classes}")
print(f"Prediction probabilities:")
for i, cls in enumerate(class_names):
    print(f"{cls}: {class_probabilities[i]:.4f}")