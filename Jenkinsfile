pipeline {
    agent any

    stages {
        stage('CI') {
            steps {
                git 'https://github.com/mohannadzidan/lexalyzer.git'
                withCredentials([usernamePassword(credentialsId: 'docker', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                sh """
                docker login -u ${USERNAME} -p ${PASSWORD}
                docker build . -t mohamed7khalifa/lexalyzer:v1.1 --network host
                docker push mohamed7khalifa/lexalyzer:v1.1
                """
                }
            }
        }
         stage('CD') {
            steps {
                git 'https://github.com/mohannadzidan/lexalyzer.git'
                withCredentials([usernamePassword(credentialsId: 'docker', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                sh """
                kubectl apply -f /var/jenkins_home/workspace/lexalyzer/app/app.yaml
                kubectl apply -f /var/jenkins_home/workspace/lexalyzer/app/service-app.yaml
                """
                }
            }
        }
    }
}
