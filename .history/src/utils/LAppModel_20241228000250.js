import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option, LogLevel } from 'live2d/live2dcubismframework';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager';
import { CubismPose } from 'live2d/effect/cubismpose';

// 모델 로드 단계 정의
const LoadStep = {
    LoadAssets: 'LoadAssets', // 모델 설정 파일 로드
    LoadModel: 'LoadModel', // 모델 데이터 로드
    LoadTextures: 'LoadTextures', // 텍스처 로드
    LoadRender: 'LoadRender', // 렌더링 초기화
    LoadPose: 'LoadPose', // 포즈 데이터 로드
    LoadMotions: 'LoadMotions', // 모션 데이터 로드
    Complete: 'Complete', // 모든 로드 및 초기화 완료
};

export class LAppModel extends CubismUserModel {
    /**
     * Live2D 모델 객체를 초기화하는 생성자입니다.
     * @param {HTMLCanvasElement} canvas - 모델을 렌더링할 캔버스
     * @param {string} modelPath - 모델 데이터가 위치한 디렉터리 경로
     * @param {string} modelFileName - 모델 설정 파일 이름 (예: model3.json)
     * @param {string} motionPath - 모션 파일들이 위치한 디렉터리 경로
     * @param {string} motionFileName - 기본 모션 파일 이름
     * @param {string} poseFileName - 포즈 파일 이름
     */
    constructor(canvas, modelPath, modelFileName, motionPath, motionFileName, poseFileName) {
        super();

        // 캔버스와 WebGL 컨텍스트 초기화
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });

        // 모델 관련 경로와 파일 이름 설정
        this.modelPath = modelPath; // 모델 데이터 디렉터리 경로
        this.modelFileName = modelFileName; // 모델 설정 파일 이름
        this.motionFileName = motionFileName; // 기본 모션 파일 이름
        this.motionPath = motionPath; // 모션 데이터 디렉터리 경로
        this.poseFileName = poseFileName; // 포즈 데이터 파일 이름

        // Live2D 관련 객체 초기화
        this._modelSetting = null; // 모델 설정 객체
        this._renderer = new CubismRenderer_WebGL(); // WebGL 렌더러
        this._projection = new CubismMatrix44(); // 모델의 프로젝션 매트릭스
        this._motions = new Map(); // 모션 데이터를 저장하는 맵
        this.motionManager = new CubismMotionManager(); // 모션 관리 객체
        this._textures = []; // 텍스처 배열
        this._pose = null; // 포즈 데이터 객체

        // 모델 로드 단계 추적 변수 초기화
        this.currentStep = LoadStep.LoadAssets;

        // 캔버스 크기 설정
        this.size = [0, 0, this.canvas.width, this.canvas.height];

        // Live2D 프레임워크 초기화
        this.initFramework();
    }

    /**
     * Live2D 프레임워크를 초기화합니다.
     * - CubismFramework가 이미 시작된 경우 초기화를 건너뛰고, 그렇지 않으면 새로 시작합니다.
     */
    initFramework() {
        const cubismOption = new Csm_Option();
        cubismOption.logFunction = console.log; // 로그 출력을 위한 함수 설정
        cubismOption.loggingLevel = LogLevel.LogLevel_Verbose; // 상세 로그 출력 설정

        if (!live2dcubismframework.CubismFramework.isStarted()) {
            // 프레임워크를 시작하고 초기화
            const initialized = live2dcubismframework.CubismFramework.startUp(cubismOption);
            if (!initialized) throw new Error('Failed to start Live2D Framework');
            live2dcubismframework.CubismFramework.initialize();
        }
    }

/**
 * 모델 초기화 메서드.
 * - 모델의 로드 및 초기화를 순차적으로 처리합니다.
 */
async initialize() {
    try {
        console.log('Initializing model...');

        // 1. 모델 설정 파일 로드
        await this.loadAssets();
        this.currentStep = LoadStep.LoadModel; // 현재 단계 갱신

        // 2. 모델 데이터 로드
        await this.loadModel();
        this.currentStep = LoadStep.LoadPose;

        // 3. 포즈 데이터 로드
        await this.loadPose();
        this.currentStep = LoadStep.LoadTextures;

        // 4. 텍스처 로드
        await this.loadTextures();
        this.currentStep = LoadStep.LoadMotions;

        // 5. 모션 데이터 로드
        await this.preloadMotions();
        this.currentStep = LoadStep.LoadRender;

        // 6. 렌더링 초기화
        await this.loadRenderProjection();
        this.currentStep = LoadStep.Complete;

        // 7. 기본 모션 시작
        this.startMotion('Idle', 0);

        console.log('Model initialization complete.');
        this.startRenderingLoop(); // 렌더링 루프 시작
    } catch (error) {
        console.error('Initialization failed:', error); // 초기화 실패 시 에러 출력
    }
}


/**
 * 모델 설정 파일을 로드합니다.
 * - 설정 파일에서 모델과 관련된 정보를 가져옵니다.
 */
async loadAssets() {
    console.log(`Loading assets...${this.modelPath} / ${this.modelFileName}`);

    const response = await fetch(`${this.modelPath}${this.modelFileName}`);
    if (!response.ok) throw new Error(`Failed to load model settings: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    this._modelSetting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength); // 설정 객체 생성
    console.log('Assets loaded.');
}

/**
 * 모델 데이터를 로드합니다.
 * - 모델의 MOC 파일을 가져오고 CubismMoc 객체를 생성합니다.
 */
async loadModel() {
    console.log(`Loading model...${this.motionPath} / ${this.modelFileName}`);

    const modelFileName = this._modelSetting.getModelFileName(); // MOC 파일 이름 가져오기
    const response = await fetch(`${this.modelPath}${modelFileName}`);
    if (!response.ok) throw new Error(`Failed to load model: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();

    this._moc = CubismMoc.create(arrayBuffer); // MOC 객체 생성
    if (!this._moc) throw new Error('Failed to create CubismMoc.');

    this._model = this._moc.createModel(); // 모델 객체 생성
    if (!this._model) throw new Error('Failed to create CubismModel.');

    console.log('Model loaded.');
}

/**
 * 텍스처를 로드합니다.
 * - 모델 설정 파일에서 지정된 모든 텍스처 파일을 WebGL 텍스처로 변환합니다.
 */
async loadTextures() {
    console.log('Loading textures...');
    const textureCount = this._modelSetting.getTextureCount(); // 텍스처 개수 확인
    const texturePromises = Array.from({ length: textureCount }, (_, i) => {
        const textureFileName = this._modelSetting.getTextureFileName(i); // 텍스처 파일 이름 가져오기
        return textureFileName ? this.loadTexture(i, `${this.modelPath}${textureFileName}`) : Promise.resolve();
    });

    await Promise.all(texturePromises); // 모든 텍스처 병렬 로드
    console.log('Textures loaded.');
}
    async loadRenderProjection() {
        this._renderer.initialize(this._model);
        this._renderer.startUp(this.gl);
        this._renderer.setIsPremultipliedAlpha(true);

        const scale = 1.0; // 모델의 스케일 값 설정 (큰 값 그대로 유지)
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        this._projection.loadIdentity(); // 초기화
        this._projection.scale(scale, scale * aspectRatio);
        this._renderer.setMvpMatrix(this._projection);
    }

    async loadPose() {
        console.log(`Loading pose...${this.modelPath}${this.poseFileName}`);

        const response = await fetch(`${this.modelPath}${this.poseFileName}`);
        if (!response.ok) throw new Error(`Failed to load pose: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        this._pose = CubismPose.create(arrayBuffer, arrayBuffer.byteLength);

        console.log('Pose:', this._pose);


        console.log('Pose loaded.');
    }

    async preloadMotions() {
        console.log(`Preloading motions...${this.motionPath}`);

        const motionGroup = 'Idle';
        const motionCount = this._modelSetting.getMotionCount(motionGroup);

        const motionPromises = Array.from({ length: motionCount }, async (_, i) => {
            const motionFileName = this._modelSetting.getMotionFileName(motionGroup, i);
            const motionPath = `${this.motionPath}${motionFileName}`;
            const response = await fetch(motionPath);
            if (!response.ok) throw new Error(`Failed to load motion: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();

            const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, `${motionGroup}_${i}`);

            let fadeTime = this._modelSetting.getMotionFadeInTimeValue(
                motionGroup,
                i
            );

            if (fadeTime >= 0.0) {
                motion.setFadeInTime(fadeTime);
            }

            fadeTime = this._modelSetting.getMotionFadeOutTimeValue(motionGroup, i);
            if (fadeTime >= 0.0) {
                motion.setFadeOutTime(fadeTime);
            }

            motion.setIsLoop(true);


            this._motions.set(`${motionGroup}_${i}`, motion);
        });

        await Promise.all(motionPromises);
        console.log('Motions preloaded.');
    }

    async loadTexture(index, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (img.width === 0 || img.height === 0) {
                    reject(new Error(`Image at ${texturePath} has invalid dimensions.`));
                    return;
                }

                const tex = this.gl.createTexture();
                // 수정본
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

                // Check for LINEAR_MIPMAP_LINEAR support and fallback if necessary
                const isLinearMipmapSupported = this.gl.getExtension('OES_texture_float') || this.gl.getExtension('OES_texture_half_float');
                const minFilter = isLinearMipmapSupported ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR;
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);

                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
                this.gl.generateMipmap(this.gl.TEXTURE_2D);

                this.gl.texImage2D(
                    this.gl.TEXTURE_2D,
                    0,
                    this.gl.RGBA,
                    this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    img
                );

                this.gl.generateMipmap(this.gl.TEXTURE_2D);

                this._textures[index] = tex;
                resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load texture: ${texturePath}`));
            img.src = texturePath;
        });
    }

    startMotion(group, index, priority = 1) {
        const name = `${group}_${index}`;
        const motion = this._motions.get(name);

        if (!motion) {
            console.warn(`Motion not found: ${name}`);
            return;
        }

        if (!this.motionManager.reserveMotion(priority)) {
            console.warn(`Motion priority too low: ${name}`);
            return;
        }

        console.log(`Starting motion: ${name}`);

        this.motionManager.startMotionPriority(motion, false, priority);
    }

    startRenderingLoop() {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        let lastFrameTime = performance.now(); // 첫 번째 프레임 처리

        const render = () => {

            const fps = 60; // 제한할 FPS
            const now = performance.now();
            const deltaTime = (now - lastFrameTime) / 1000; // 초 단위 경과 시간 계산

            lastFrameTime = now; // 업데이트 완료 시점 갱신

            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            if (this._model && this._textures.length > 0) {

                //this.updateModelParameters();

                if (this._pose != null) {
                    this._pose.updateParameters(this._model, deltaTime); // 초 단위 경과 시간
                }

                this.motionManager.updateMotion(this._model, deltaTime);

                this._textures.forEach((texture, i) => this._renderer.bindTexture(i, texture));
                this._model.update();

                if (!this.frameBuffer) {
                    this.frameBuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
                }

                this._renderer.setRenderState(this.frameBuffer, this.size);
                this._renderer.drawModel();
            }

            requestAnimationFrame(render);
        };
        render();
    }

    destroy() {
        this._textures.forEach(texture => this.gl.deleteTexture(texture));
        this._textures = [];
        if (this._moc) this._moc.release();
        this._moc = null;
    }
}