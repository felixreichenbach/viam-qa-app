# Validate Trained ML Model

This Python script uses your trained TFLite model and in combination with a folder of validation images outputs its performance.

## Setup

```shell
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run The Validation

Update the command with your files and folders:

```shell
python validate.py "../static/model.tflite" "./images" --labels "../static/labels.txt" --output "validation_results.json"
```

## Result (Example)

```json
[
  {
    "filename": "OK_20250630_122528.jpg",
    "max_score": 0.9503721594810486,
    "predicted_class_label": "OK",
    "class_scores": {
      "VIAM_UNKNOWN": 0.0014708881499245763,
      "NOK": 0.04815700650215149,
      "OK": 0.9503721594810486
    }
  },
  {
    "filename": "OK_20250630_122514.jpg",
    "max_score": 0.8874809145927429,
    "predicted_class_label": "OK",
    "class_scores": {
      "VIAM_UNKNOWN": 0.0015252443263307214,
      "NOK": 0.11099381744861603,
      "OK": 0.8874809145927429
    }
  },
  ...
]
```
