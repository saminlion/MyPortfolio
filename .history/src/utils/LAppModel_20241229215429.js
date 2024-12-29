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
     * @param {string} modelHomeDir - 모델 데이터가 위치한 디렉터리 경로
     * @param {string} modelFileName - 모델 설정 파일 이름 (예: model3.json)
     * @param {string} motionFileName - 기본 모션 파일 이름
     * @param {string} poseFileName - 포즈 파일 이름
         * @param {number} scale - 모델 스케일
     * @param {number} xPos - 모델 X 위치
     * @param {number} yPos - 모델 Y 위치
 */
    constructor(canvas, modelHomeDir, modelFileName, motionFileName, poseFileName, scale, xPos, yPos, groupName, groupIndex) {
        super();

        // 캔버스와 WebGL 컨텍스트 초기화
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });

        // 모델 관련 경로와 파일 이름 설정
        this.modelHomeDir = modelHomeDir; // 모델 데이터 디렉터리 경로
        this.modelFileName = modelFileName; // 모델 설정 파일 이름
        this.motionFileName = motionFileName; // 기본 모션 파일 이름
        this.poseFileName = poseFileName; // 포즈 데이터 파일 이름
        this.groupName = groupName; // 모션 그룹 이름
        this.groupIndex = groupIndex; // 모션 그룹 이름

        // Live2D 관련 객체 초기화
        this._modelSetting = null; // 모델 설정 객체
        this._renderer = new CubismRenderer_WebGL(); // WebGL 렌더러
        this._projection = new CubismMatrix44(); // 모델의 프로젝션 매트릭스
        this._motions = new Map(); // 모션 데이터를 저장하는 맵
        this.motionManager = new CubismMotionManager(); // 모션 관리 객체
        this._textures = []; // 텍스처 배열
        this._pose = null; // 포즈 데이터 객체
        this._modelScale = scale;

        // 모델 로드 단계 추적 변수 초기화
        this.currentStep = LoadStep.LoadAssets;

        // 캔버스 크기 설정
        this.size = [xPos, yPos, this.canvas.width, this.canvas.height];

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
            this.IdleMotion('Idle', this.groupIndex, 1);

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
        console.log(`Loading assets...${this.modelHomeDir} / ${this.modelFileName}`);

        const response = await fetch(`${this.modelHomeDir}${this.modelFileName}`);
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
        console.log(`Loading model...${this.modelHomeDir} / ${this.modelFileName}`);

        const modelFileName = this._modelSetting.getModelFileName(); // MOC 파일 이름 가져오기
        const response = await fetch(`${this.modelHomeDir}${modelFileName}`);
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
            return textureFileName ? this.loadTexture(i, `${this.modelHomeDir}${textureFileName}`) : Promise.resolve();
        });

        await Promise.all(texturePromises); // 모든 텍스처 병렬 로드
        console.log('Textures loaded.');
    }

    /**
     * 렌더링 프로젝션 및 모델 초기화 설정
     * - 모델의 렌더링 상태와 투영 매트릭스를 초기화합니다.
     */
    async loadRenderProjection() {
        // WebGL 렌더러 초기화 및 설정
        this._renderer.initialize(this._model); // 모델을 렌더러에 연결
        this._renderer.startUp(this.gl); // WebGL 컨텍스트와 연결
        this._renderer.setIsPremultipliedAlpha(true); // 알파값 프리멀티플라이 설정

        // 모델의 스케일 및 화면 비율 계산
        const scale = this._modelScale; // 기본 스케일 값 (조정 가능)
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const aspectRatio = canvasWidth / canvasHeight; // 화면 비율 계산

        // 투영 매트릭스 초기화 및 설정
        this._projection.loadIdentity(); // 기존 투영 매트릭스 초기화
        this._projection.scale(scale, scale * aspectRatio); // 화면 비율에 따라 스케일 설정
        this._renderer.setMvpMatrix(this._projection); // 렌더러에 투영 매트릭스 적용
    }

    /**
     * 포즈 데이터를 로드합니다.
     * - Live2D 모델의 포즈 데이터 파일을 로드하고, 모델에 적용합니다.
     */
    async loadPose() {

        if (this.poseFileName) {
            console.log(`Loading pose...${this.modelHomeDir}${this.poseFileName}`);

            // 포즈 데이터 파일 로드
            const response = await fetch(`${this.modelHomeDir}${this.poseFileName}`);
            if (!response.ok) throw new Error(`Failed to load pose: ${response.statusText}`); // 파일 로드 실패 처리
            const arrayBuffer = await response.arrayBuffer();

            // 포즈 데이터 생성 및 적용
            this._pose = CubismPose.create(arrayBuffer, arrayBuffer.byteLength);
            console.log('Pose loaded.');
        }
    }

    /**
  * 모션 데이터를 사전 로드합니다.
  * - 지정된 모션 그룹에 속한 모든 모션 데이터를 로드하고, 각 모션에 대한 설정을 초기화합니다.
  */
    async preloadMotions() {
        console.log(`Preloading motions...${this.modelHomeDir}`);

        const motionGroupCount = this._modelSetting.getMotionGroupCount() // 보유한 모션 그룹 전체 개수

        for (let groupIndex = 0; groupIndex < motionGroupCount; groupIndex++) {
            const motionGroup = this._modelSetting.getMotionGroupName(groupIndex); // 보유한 모션 그룹 이름
            const motionCount = this._modelSetting.getMotionCount(motionGroup); // 각 그룹의 모션 개수

            console.log(`Loading motion group: ${motionGroup} (${motionCount} motions)`);

            // 모든 모션 파일 비동기 로드
            const motionPromises = Array.from({ length: motionCount }, async (_, motionIndex) => {
                try {
                    const motionFileName = this._modelSetting.getMotionFileName(motionGroup, motionIndex); // 모션 파일 이름 가져오기
                    const motionPath = `${this.modelHomeDir}${motionFileName}`; // 모션 파일 경로 생성
                    const response = await fetch(motionPath);
                    if (!response.ok) throw new Error(`Failed to load motion at ${motionPath}: ${response.statusText}`); // 로드 실패 처리
                    const arrayBuffer = await response.arrayBuffer();

                    // 모션 생성 및 초기화
                    const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, `${motionGroup}_${motionIndex}`);

                    let fadeTime = this._modelSetting.getMotionFadeInTimeValue(motionGroup, motionIndex);
                    if (fadeTime >= 0.0) motion.setFadeInTime(fadeTime); // 페이드 인 설정

                    fadeTime = this._modelSetting.getMotionFadeOutTimeValue(motionGroup, motionIndex);
                    if (fadeTime >= 0.0) motion.setFadeOutTime(fadeTime); // 페이드 아웃 설정
                    
                    //motion.setIsLoop(true); // 루프 설정

                    this._motions.set(`${motionGroup}_${motionIndex}`, motion); // 모션 저장
                    console.log(`Loaded motion: ${motionGroup}_${motionIndex}`); // 로드 모션 체크
                }
                catch (error) {
                    console.error(`Error loading motion ${motionGroup}_${motionIndex}:`, error);
                }
            });

            await Promise.all(motionPromises); // 모든 모션 로드 완료 대기
        }

        console.log('All motions preloaded.');
    }

    /**
  * 텍스처를 로드합니다.
  * - 텍스처 파일을 로드하고 WebGL 텍스처 객체를 생성 및 설정합니다.
  * @param {number} index - 텍스처의 인덱스
  * @param {string} texturePath - 텍스처 파일 경로
  */
    async loadTexture(index, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image(); // 이미지 객체 생성

            // 이미지 로드 성공 시 콜백
            img.onload = () => {
                if (img.width === 0 || img.height === 0) {
                    reject(new Error(`Image at ${texturePath} has invalid dimensions.`)); // 유효하지 않은 이미지 처리
                    return;
                }

                // WebGL 텍스처 객체 생성 및 설정
                const tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex); // 텍스처 바인딩
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE); // 텍스처 좌우 반복 설정
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE); // 텍스처 상하 반복 설정

                // LINEAR_MIPMAP_LINEAR 지원 여부에 따라 필터링 설정
                const isLinearMipmapSupported = this.gl.getExtension('OES_texture_float') || this.gl.getExtension('OES_texture_half_float');
                const minFilter = isLinearMipmapSupported ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR;
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter); // 최소 필터 설정
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR); // 최대 필터 설정

                this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); // 알파값 설정
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img); // 텍스처 데이터 업로드
                this.gl.generateMipmap(this.gl.TEXTURE_2D); // Mipmap 생성

                this._textures[index] = tex; // 텍스처 저장
                resolve();
            };

            // 이미지 로드 실패 시 콜백
            img.onerror = () => reject(new Error(`Failed to load texture: ${texturePath}`));
            img.src = texturePath; // 이미지 로드 시작
        });
    }

    /**
     * 기본 모션을 실행합니다.
     * @param {string} group - 모션 그룹 이름
     * @param {number} index - 모션의 인덱스
     * @param {number} priority - 모션 실행 우선순위
     */
    IdleMotion(group, index, priority = 1) {
        const name = `${group}_${index}`; // 그룹과 인덱스를 조합하여 모션 이름 생성
        const motion = this._motions.get(name); // 모션 객체 가져오기

        if (!motion) {
            console.warn(`Motion not found: ${name}`); // 모션이 없는 경우 경고 출력
            return;
        }

        // if (!this.motionManager.reserveMotion(priority)) {
        //     console.warn(`Motion priority too low: ${name}`); // 우선순위가 낮아 실행되지 않을 경우 경고 출력
        //     return;
        // }

        console.log(`Starting motion: ${name}`); // 실행되는 모션 로그 출력

        motion.setIsLoop(true); // 루프 설정

        this.motionManager.startMotionPriority(motion, false, priority); // 모션 실행
    }

    /**
     * 커스텀 모션을 실행합니다.
     * @param {string} group - 모션 그룹 이름
     * @param {number} index - 모션의 인덱스
     * @param {number} priority - 모션 실행 우선순위
     * @param {boolean} random - 해당 그룹 중 렌덤 모션 실행
      * @param {Function} customCallback - custom 콜백 함수
*/
    CustomMotion(group, index, priority = 1, random=false, customCallback = null) {

        const newIndex = 0;

        if (random)
        {
            const maxIndex = this._modelSetting.getMotionCount(group);

            newIndex = Math.random() * maxIndex;
        }

        else
        {
            newIndex = index;
        }

        const name = `${group}_${newIndex}`; // 그룹과 인덱스를 조합하여 모션 이름 생성
        const motion = this._motions.get(name); // 모션 객체 가져오기

        if (!motion) {
            console.warn(`Motion not found: ${name}`); // 모션이 없는 경우 경고 출력
            return;
        }

        // if (!this.motionManager.reserveMotion(priority)) {
        //     console.warn(`Motion priority too low: ${name}`); // 우선순위가 낮아 실행되지 않을 경우 경고 출력
        //     return;
        // }

        console.log(`Starting motion: ${name}`); // 실행되는 모션 로그 출력

        motion.setIsLoop(false); // 루프 설정

        this.motionManager.startMotionPriority(motion, false, priority, () => {
            console.log(`Custom motion finished: ${name}`);

                    // 콜백 함수로 dissolve 실행
        if (typeof customCallback === 'function') {
            customCallback();
        }

            this.IdleMotion('Idle', 0, 1); // IdleMotion 실행
        }); // 모션 실행
    }

    /**
     * Live2D 모델의 렌더링 루프를 설정합니다.
     * - WebGL 상태를 초기화하고 FPS를 제한하여 모델을 렌더링합니다.
     */
    startRenderingLoop() {
        this.gl.enable(this.gl.BLEND); // 블렌딩 활성화
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); // 알파 블렌딩 설정
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); // 뷰포트 설정

        let lastFrameTime = performance.now(); // 초기 프레임 시간 기록

        const render = () => {
            const fps = 60; // 제한할 FPS
            const frameInterval = 1000 / fps; // 프레임 간격 (밀리초 단위)
            const now = performance.now(); // 현재 시간 가져오기
            const deltaTime = now - lastFrameTime; // 경과 시간 계산

            // if (deltaTime >= frameInterval) { // 프레임 간격을 초과한 경우에만 렌더링 실행
            lastFrameTime = now - (deltaTime % frameInterval); // 남은 시간 보정

            this.gl.clearColor(0.0, 0.0, 0.0, 0.0); // 캔버스 배경색 설정 (투명 블랙)
            this.gl.clear(this.gl.COLOR_BUFFER_BIT); // 캔버스 초기화

            if (this._model && this._textures.length > 0) {
                if (this._pose != null) {
                    this._pose.updateParameters(this._model, deltaTime / 2000); // 포즈 업데이트 (초 단위로 전달)
                }

                this.motionManager.updateMotion(this._model, deltaTime / 2000); // 모션 업데이트 (초 단위로 전달)

                this._textures.forEach((texture, i) => this._renderer.bindTexture(i, texture)); // 텍스처 바인딩
                this._model.update(); // 모델 업데이트

                if (!this.frameBuffer) {
                    this.frameBuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING); // 프레임버퍼 가져오기
                }

                this._renderer.setRenderState(this.frameBuffer, this.size); // 렌더링 상태 설정
                this._renderer.drawModel(); // 모델 그리기
            }
            //            }

            requestAnimationFrame(render); // 다음 프레임 요청
        };
        render(); // 렌더링 시작
    }

    /**
     * Live2D 모델에서 사용한 리소스를 정리합니다.
     * - 텍스처 및 모델 데이터를 해제하여 메모리 누수를 방지합니다.
     */
    destroy() {
        this._textures.forEach(texture => this.gl.deleteTexture(texture)); // 텍스처 삭제
        this._textures = []; // 텍스처 배열 초기화
        if (this._moc) this._moc.release(); // MOC 데이터 해제
        this._moc = null; // MOC 객체 초기화
    }
}
