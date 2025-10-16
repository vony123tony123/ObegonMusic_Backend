// Optimized Jenkinsfile for Docker-based CI/CD

pipeline {
    // 1. 指定 Jenkins Agent
    // 这里的 agent 需要能够访问 Docker daemon。
    // 一种常见的作法是使用 'docker' agent，或者在一个已安装 Docker 的节点上运行。
    agent any

    environment {
        // 定义镜像名称和标签，方便管理
        DOCKER_IMAGE_NAME = "my-express-app"
        DOCKER_IMAGE_TAG  = "build-${env.BUILD_NUMBER}"
        BUILDER_IMAGE     = "my-express-app-builder:${env.BUILD_NUMBER}"
    }

    stages {
        // Stage 1: 检出代码
        stage('Checkout') {
            steps {
                echo 'Checking out the latest code...'
                checkout scm
            }
        }

        // Stage 2: 构建用于测试的 Builder 镜像
        // 这个镜像包含了运行测试所需的所有 devDependencies
        stage('Build Test Image') {
            steps {
                echo "Building the builder image: ${BUILDER_IMAGE}..."
                // 我们只构建 Dockerfile 中的 'builder' 阶段，并给它一个标签
                sh "docker build --target builder -t ${BUILDER_IMAGE} ."
            }
        }

        // Stage 3: 在容器内运行测试
        // 确保测试环境干净且一致
        stage('Run Tests in Container') {
            steps {
                echo 'Running tests inside the builder container...'
                // 我们在刚刚构建的 builder 镜像中运行测试命令
                // --rm 会在命令结束后自动删除容器
                sh "docker run --rm ${BUILDER_IMAGE} pnpm test"
            }
        }

        // Stage 4: 构建并推送生产镜像
        // 只有在测试通过后才会执行此阶段
        stage('Build & Push Production Image') {
            steps {
                echo "Building production image: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}..."
                // 使用 Jenkins 的 Docker-Pipeline 插件来构建和推送
                // 这需要您在 Jenkins 中配置好 Docker Hub 或其他镜像仓库的凭证
                script {
                    // 构建最终的、轻量级的 'production' 镜像
                    def customImage = docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}", "--target production .")

                    // 在真实场景中，您会在这里推送到镜像仓库
                    // docker.withRegistry('https://your-docker-registry.com', 'your-credentials-id') {
                    //     customImage.push()
                    //
                    //     // 通常也会给最新的 build 打上 'latest' 标签
                    //     customImage.tag('latest')
                    //     customImage.push('latest')
                    // }
                    echo "Image ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} built successfully."
                    echo "To push, uncomment the withRegistry block and configure your registry credentials in Jenkins."
                }
            }
        }

        // Stage 5: 部署
        stage('Deploy') {
            steps {
                echo "Deploying ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}..."
                // 这里是您实际的部署命令
                // 例如: sh "./deploy.sh ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                input 'Ready to deploy to production?' // 暂停流水线，等待手动确认
            }
        }
    }

    // 4. 后续操作
    post {
        always {
            echo 'Pipeline execution finished.'
            // 清理 builder 镜像，节省 Jenkins agent 上的磁盘空间
            echo "Cleaning up builder image ${BUILDER_IMAGE}..."
            // '|| true' 确保即使镜像不存在或删除失败，流水线也不会失败
            sh "docker rmi ${BUILDER_IMAGE} || true"
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}