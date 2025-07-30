import tensorflow as tf
import numpy as np
import json
import os
from PIL import Image
import argparse


def load_and_preprocess_image(image_path):
    """Load and preprocess image for model input"""
    image = Image.open(image_path)

    # Convert to RGB if needed
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Resize to exactly 256x256 (model expects this size)
    image = image.resize((256, 256))

    # Convert to numpy array as uint8 (0-255 values)
    image_array = np.array(image, dtype=np.uint8)

    # Add batch dimension to make it [1, 256, 256, 3]
    image_array = np.expand_dims(image_array, axis=0)

    return image_array


def main():
    parser = argparse.ArgumentParser(
        description="Validate TensorFlow Lite model on images"
    )
    parser.add_argument("model_path", help="Path to .tflite model file")
    parser.add_argument("images_dir", help="Directory containing images")
    parser.add_argument("--output", default="results.json", help="Output JSON file")
    parser.add_argument("--labels", help="Path to labels.txt file (optional)")

    args = parser.parse_args()

    # Load class labels if provided
    class_labels = []
    if args.labels and os.path.exists(args.labels):
        with open(args.labels, "r") as f:
            class_labels = [line.strip() for line in f.readlines()]
        print(f"Loaded {len(class_labels)} class labels: {class_labels}")

    # Load the TensorFlow Lite model
    interpreter = tf.lite.Interpreter(model_path=args.model_path)
    interpreter.allocate_tensors()

    # Get input and output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print(f"Model input shape: {input_details[0]['shape']}")
    print(f"Model output shape: {output_details[0]['shape']}")

    # Get all image files
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}
    image_files = [
        f
        for f in os.listdir(args.images_dir)
        if os.path.splitext(f.lower())[1] in image_extensions
    ]

    results = {}

    print(f"Processing {len(image_files)} images...")

    for i, filename in enumerate(image_files):
        print(f"Processing {i+1}/{len(image_files)}: {filename}")

        try:
            image_path = os.path.join(args.images_dir, filename)

            # Load and preprocess image
            input_data = load_and_preprocess_image(image_path)

            # Set input tensor
            interpreter.set_tensor(input_details[0]["index"], input_data)

            # Run inference
            interpreter.invoke()

            # Get output
            output_data = interpreter.get_tensor(output_details[0]["index"])
            predictions = output_data[0].tolist()  # Remove batch dimension

            predicted_class_index = int(np.argmax(predictions))

            # Get label name if available
            if class_labels and predicted_class_index < len(class_labels):
                predicted_label = class_labels[predicted_class_index]
            else:
                predicted_label = f"class_{predicted_class_index}"

            # Create class scores with labels
            if class_labels:
                class_scores = {
                    class_labels[i] if i < len(class_labels) else f"class_{i}": float(
                        score
                    )
                    for i, score in enumerate(predictions)
                }
            else:
                class_scores = {
                    f"class_{i}": float(score) for i, score in enumerate(predictions)
                }

            # Store results
            results[filename] = {
                # "predictions": predictions,
                "max_score": float(max(predictions)),
                "predicted_class_label": predicted_label,
                "class_scores": class_scores,
            }

        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")
            results[filename] = {"error": str(e)}

    # Save results as a list of documents (one per image)
    results_list = [
        {"filename": filename, **result} for filename, result in results.items()
    ]
    with open(args.output, "w") as f:
        json.dump(results_list, f, indent=2)

    print(f"Results saved to {args.output}")

    # Print summary
    successful = len([r for r in results.values() if "error" not in r])
    print(f"Successfully processed: {successful}/{len(image_files)} images")


if __name__ == "__main__":
    main()
