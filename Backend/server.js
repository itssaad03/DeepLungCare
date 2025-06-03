const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('./model/user'); // Import the User model
const Patient = require('./model/patient'); // Import the Patient model
const cors = require('cors');
const authMiddleware = require('./middleware/auth'); // Import authMiddleware from the separate file
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const upload = require('./middleware/multer');

const app = express();
app.use(cors()); // Allow cross-origin requests from React app
app.use(express.static(path.join(__dirname, 'python'))); // Serve static files from server/python
app.use(bodyParser.json()); // Parse incoming JSON requests

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Final_Year_Project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error));

// POST endpoint for signup
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input data
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Signup failed, please try again' });
  }
});

// POST endpoint for login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed, please try again' });
  }
});

// POST endpoint for patient registration
app.post('/api/registerPatient', authMiddleware, async (req, res) => {
  const { patientName, gender, email, contact, bloodGroup, opd, smoker, previousLungDisease } = req.body;
  
  // Validate input data
  if (!patientName || !gender || !email || !contact || !bloodGroup || !smoker || !previousLungDisease) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    console.log('Serial number received in backend:', req.body.serialNumber);
    // Check if email already exists for a patient
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }
    // Create a new patient document
    const newPatient = new Patient({
      serialNumber: req.body.serialNumber, // Use serial number from frontend
      patientName,
      gender,
      email,
      contact,
      bloodGroup,
      opd,
      smoker,
      previousLungDisease,
      doctorId: req.doctor._id, // Assign the authenticated doctor's ID
    });

    await newPatient.save();
    
    res.status(201).json({ message: 'Patient registered successfully!' });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ message: 'Failed to register patient' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
app.get('/api/patients', authMiddleware, async (req, res) => {
  try {
    const patients = await Patient.find({ doctorId: req.doctor._id }); // only return that doctor's patients
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});
// routes/patient.js or similar
app.get('/api/registerPatient/:serialNumber', async (req, res) => {
  try {
    const serial = req.params.serialNumber.trim(); // trim any accidental whitespace
    const patient = await Patient.findOne({ serialNumber: serial });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/detectDisease', upload.single('image'), async (req, res) => {
  try {
    console.log('File received:', req.file); // Debug log
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if file exists before processing
    const filePath = req.file.path;
    console.log('Checking if file exists at:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return res.status(400).json({ error: 'Uploaded file not found on server' });
    }

    console.log('File path before spawning Python process:', filePath);
    console.log('File exists before spawning Python process:', fs.existsSync(filePath));

    // Use 'python' for Windows compatibility
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'python/model.py'),
      path.resolve(filePath)
    ], {
      cwd: path.join(__dirname, 'python')
    });

    let resultData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('Python Error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      // Clean up file regardless of result
      fs.unlink(filePath, (err) => {
        if (err) console.error('File cleanup error:', err);
      });

      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Model execution failed',
          details: errorData 
        });
      }

      try {
        const result = JSON.parse(resultData);
        res.json(result);
      } catch (parseErr) {
        console.error('Result parse error:', parseErr);
        console.error('Raw output:', resultData);
        res.status(500).json({ 
          error: 'Invalid model output',
          output: resultData 
        });
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server processing error' });
  }
});

app.post('/api/generateReport', async (req, res) => {
  try {
    const { data, template } = req.body;

    if (!data || !template) {
      return res.status(400).json({ message: 'Missing data or template in request body' });
    }

    const reportScriptPath = path.join(__dirname, 'python', 'report.py');
    console.log('Resolved report.py path:', reportScriptPath);
    const pythonProcess = spawn('python', [reportScriptPath]);

    let resultData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('Python Error:', data.toString());
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: 'Report generation failed',
          details: errorData
        });
      }

      // Parse summary info JSON from stderr (errorData)
      let summaryInfo = null;
      try {
        const match = errorData.match(/\{[\s\S]*\}/); // Extract JSON object from stderr
        if (match) {
          summaryInfo = JSON.parse(match[0]).summary_info;
        }
      } catch (parseErr) {
        console.error('Failed to parse summary info JSON:', parseErr);
      }

      // Update patient report fields in MongoDB if summaryInfo and patient identifier exist
            if (summaryInfo && data.serialNumber) {
              try {
                const patient = await Patient.findOne({ serialNumber: data.serialNumber });
                if (patient) {
                  patient.summary = summaryInfo.summary || patient.summary;
                  // Validate last_visit_date before setting lastVisitDate
                  if (summaryInfo.last_visit_date && !isNaN(Date.parse(summaryInfo.last_visit_date))) {
                    patient.lastVisitDate = new Date(summaryInfo.last_visit_date);
                  }
                  patient.recommendedDisease = data.disease || patient.recommendedDisease;

                  // Add new entry to history array
                  patient.history = patient.history || [];
                  patient.history.push({
                    disease: data.disease || '',
                    summary: summaryInfo.summary || '',
                    lastVisitDate: summaryInfo.last_visit_date && !isNaN(Date.parse(summaryInfo.last_visit_date)) ? new Date(summaryInfo.last_visit_date) : null
                  });

                  await patient.save();
                  console.log(`Patient report updated successfully for serialNumber: ${data.serialNumber}`);
                } else {
                  console.warn('Patient not found with serialNumber:', data.serialNumber);
                }
              } catch (dbErr) {
                console.error('Error updating patient report fields:', dbErr);
              }
            }

      // resultData is base64 encoded PDF string
      res.json({ pdfBase64: resultData });
    });

    // Write JSON input to python process stdin
    pythonProcess.stdin.write(JSON.stringify({ data, template }));
    pythonProcess.stdin.end();

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server processing error' });
  }
});
app.get('/api/patientReport/:serialNumber', authMiddleware, async (req, res) => {
  try {
    const serial = req.params.serialNumber.trim();
    const patient = await Patient.findOne({ serialNumber: serial });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Return report fields and history for the patient
    const reportData = {
      summary: patient.summary || '',
      lastVisitDate: patient.lastVisitDate || null,
      recommendedDisease: patient.recommendedDisease || '',
      history: patient.history || []
    };

    res.status(200).json(reportData);
  } catch (err) {
    console.error('Error fetching patient report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
