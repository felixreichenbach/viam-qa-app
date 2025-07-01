# Viam Visual Quality Check App

Simple web application which allows taking an image from the camera and run it through an ML model trained in the Viam platform.
Classifications and score are displayed on screen. Code can easily be changed to object detection.

## Developing

Install the dependencies and start a development server:

```bash
pnpm install

npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Add Your Own ML Model

The model is place in the static folder as `model.tflite`. You should be able to simply replace it with another Tflite model usin the same name.

If you have trained a model in the Viam platform, you can use the following URL schema to download your model:

```
https://app.viam.com/packages/<registry-item-org-id>/<modelname>/ml_model/<version>/<requesting-org-id>

```

Will bring this up with the Viam SDK team to make it much easier.

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
