// Import necessary Live2D modules
import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { LogLevel } from 'live2d/live2dcubismframework'; // LogLevel 가져오기
import { Live2DCubismFramework as live2dcubismframework } from 'live2d/live2dcubismframework';

class Live2DWebGLApp {
  constructor(canvas, modelPath, modelFileName, motionPath, motionName) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!this.gl) throw new Error('Failed to initialize WebGL.');

    this.modelPath = modelPath;
    this.modelFileName = modelFileName;
    this.motionPath = motionPath;
    this.motionName = motionName;

    this._model = null;
    this._renderer = new CubismRenderer_WebGL();
    this._moc = null;
    this._textures = [];
    this._projection = new CubismMatrix44();
    this.motionManager = new CubismMotionManager();

    this.mousePosition = { x: 0, y: 0 };
  }

  async initialize() {
    this.initFramework();
    await this.loadAssets();
    this.startRenderingLoop();
  }

  initFramework() {
    const cubismOption = {
      logFunction: console.log,
      loggingLevel: LogLevel.LogLevel_Verbose, // LogLevel 설정
  };

  if (!live2dcubismframework.CubismFramework.isStarted()) {
      const initialized = live2dcubismframework.CubismFramework.startUp(cubismOption);
      if (!initialized) throw new Error('Failed to start Live2D Framework');
      live2dcubismframework.CubismFramework.initialize();
  }
}

  async loadAssets() {
    try {
      const response = await fetch(`${this.modelPath}${this.modelFileName}`);
      const arrayBuffer = await response.arrayBuffer();

      const setting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
      await this.setupModel(setting);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }

  async setupModel(setting) {
    this._modelSetting = setting;

    const modelFileName = setting.getModelFileName();
    const modelResponse = await fetch(`${this.modelPath}${modelFileName}`);
    const modelBuffer = await modelResponse.arrayBuffer();

    this._moc = CubismMoc.create(modelBuffer);
    if (!this._moc) throw new Error('Failed to create CubismMoc.');

    this._model = this._moc.createModel();
    if (!this._model) throw new Error('Failed to create CubismModel.');

    // Check clipping information
    if (setting.getClippingContextCount() > 0) {
        console.log('Clipping context detected.');
    } else {
        console.warn('No clipping context found.');
    }

    // Load textures
    const textureCount = this._modelSetting.getTextureCount();
    const texturePromises = [];
    for (let i = 0; i < textureCount; i++) {
        const textureFileName = this._modelSetting.getTextureFileName(i);
        if (textureFileName) {
            texturePromises.push(this.loadTexture(i, `${this.modelPath}${textureFileName}`));
        }
    }

    await Promise.all(texturePromises);

    this._renderer.initialize(this._model);
    this._renderer.startUp(this.gl);
    this._renderer.setIsPremultipliedAlpha(true);

    const canvasAspect = this.canvas.width / this.canvas.height;
    this._projection.loadIdentity();
    this._projection.scale(2.0, 2.0 * canvasAspect);
    this._renderer.setMvpMatrix(this._projection);
  }

  async loadTexture(index, texturePath) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        this._textures[index] = texture;
        resolve();
      };

      img.onerror = () => {
        console.error(`Failed to load texture: ${texturePath}`); // 오류 로그
        reject(new Error(`Failed to load texture: ${texturePath}`));
      };
      
      img.src = texturePath;
    });
  }

  startRenderingLoop() {
    const render = () => {
      this.gl.clearColor(0.0, 0.0, 0.0, 0.0); // 배경색 설정
this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      for (let i = 0; i < this._textures.length; i++) {
        this._renderer.bindTexture(i, this._textures[i]);
      }

      if (this._model) {
        this.updateModelParameters();
        this.motionManager.updateMotion(this._model, 1 / 60);
        this._model.update();
        this._renderer.drawModel();
      }

      requestAnimationFrame(render);
    };

    render();
  }

  updateModelParameters() {
    if (!this._model) return;

    const { x, y } = this.mousePosition;
    this._model.setParameterValueByIndex(0, x * 30);
    this._model.setParameterValueByIndex(1, y * 30);
    this._model.setParameterValueByIndex(2, x * y * -10);
  }

  updateMousePosition(x, y) {
    this.mousePosition.x = x;
    this.mousePosition.y = y;
  }
}

export default Live2DWebGLApp;
