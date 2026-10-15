# 🌦️ ESP32 + MQTT + OpenWeatherMap

Projeto desenvolvido para demonstrar a integração entre **Internet das Coisas (IoT)**, **MQTT**, **ESP32** e a **API OpenWeatherMap**, permitindo consultar dados climáticos de diferentes cidades e apresentar as informações em uma interface web.

## 📌 Sobre o projeto

A aplicação permite que o usuário informe uma cidade e um país para consultar informações meteorológicas em tempo real por meio da API do **OpenWeatherMap**.

Os principais dados obtidos são:

* 🌡️ Temperatura em graus Celsius;
* 💧 Umidade relativa do ar;
* 🌎 Cidade consultada;
* 🕐 Horário da atualização;
* 📊 Histórico das leituras em um gráfico.

Além da consulta à API, os dados são publicados utilizando o protocolo **MQTT**, permitindo que dispositivos IoT, como um **ESP32**, possam receber ou utilizar essas informações.

## 🎯 Objetivo

Demonstrar, de forma prática, a integração entre diferentes tecnologias utilizadas em projetos de IoT:

**Aplicação Web → OpenWeatherMap → MQTT → ESP32**

O projeto também permite compreender conceitos como:

* Consumo de APIs REST;
* Requisições HTTP utilizando `fetch()`;
* Comunicação MQTT;
* Publicação e assinatura de tópicos;
* Manipulação de dados JSON;
* Programação JavaScript;
* Visualização de dados;
* Integração entre sistemas Web e dispositivos IoT.

## 🛠️ Tecnologias utilizadas

* HTML5
* CSS3
* JavaScript
* MQTT
* MQTT.js
* Chart.js
* OpenWeatherMap API
* HiveMQ MQTT Broker
* ESP32

## 🔗 Bibliotecas utilizadas

### MQTT.js

Biblioteca utilizada para estabelecer a comunicação MQTT diretamente pelo navegador.

```html
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
```

### Chart.js

Biblioteca utilizada para criar o gráfico de temperatura e umidade.

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

## 🌐 OpenWeatherMap

A aplicação utiliza a API do OpenWeatherMap para consultar os dados meteorológicos.

O usuário deve criar uma conta e gerar uma **API Key**.

Depois, a chave deve ser configurada no código:

```javascript
const OPENWEATHER_API_KEY = "0cb7fea0cbc1ad53bf005cf807b9f0c4";
```

### ⚠️ Importante

**Não publique sua API Key real no GitHub.**

Para disponibilizar o projeto publicamente, recomenda-se utilizar uma variável de ambiente ou outra estratégia de proteção da chave.

Se uma chave for publicada acidentalmente, ela deve ser substituída/revogada no serviço correspondente.

## 📡 Comunicação MQTT

O projeto utiliza o broker público da HiveMQ:

```text
broker.hivemq.com
```

Para comunicação WebSocket, é utilizada a porta:

```text
8000
```

Configuração utilizada:

```javascript
const MQTT_BROKER =
  "ws://broker.hivemq.com:8000/mqtt";
```

## 📋 Tópicos MQTT

O projeto utiliza os seguintes tópicos:

| Tópico                    | Função                          |
| ------------------------- | ------------------------------- |
| `esp32/clima/temperatura` | Publicação da temperatura       |
| `esp32/clima/umidade`     | Publicação da umidade           |
| `esp32/clima/cidadeAtual` | Publicação da cidade consultada |
| `esp32/clima/cidade`      | Envio da cidade selecionada     |

### Exemplo

Ao consultar:

```text
Brotas,BR
```

a aplicação pode publicar:

```text
esp32/clima/temperatura
```

com:

```text
24.5
```

E:

```text
esp32/clima/umidade
```

com:

```text
65
```

## 🔄 Funcionamento do projeto

O funcionamento pode ser representado pelo seguinte fluxo:

```text
┌─────────────────────┐
│     Usuário         │
│  Escolhe a cidade   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Aplicação Web     │
│      HTML/JS        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   OpenWeatherMap    │
│      API REST       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Temperatura         │
│ Umidade             │
│ Cidade              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    MQTT / HiveMQ    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       ESP32         │
│   Sistema IoT       │
└─────────────────────┘
```

## 📊 Gráfico

O projeto utiliza o **Chart.js** para apresentar graficamente os dados recebidos.

São exibidas duas informações:

* Temperatura;
* Umidade.

O gráfico mantém um histórico de até **30 pontos de leitura**, evitando que a quantidade de dados cresça indefinidamente na tela.

## 💻 Interface Web

A interface permite:

1. Informar o nome da cidade;
2. Selecionar o país;
3. Consultar o clima;
4. Visualizar temperatura;
5. Visualizar umidade;
6. Visualizar a cidade atual;
7. Acompanhar os dados em um gráfico;
8. Publicar os dados utilizando MQTT.

## 🚀 Como executar

### 1. Baixar o projeto

Clone o repositório:

```bash
git clone URL_DO_SEU_REPOSITORIO
```

Entre na pasta:

```bash
cd nome-do-projeto
```

### 2. Configurar a API Key

Abra o arquivo HTML e localize:

```javascript
const OPENWEATHER_API_KEY =
  "0cb7fea0cbc1ad53bf005cf807b9f0c4";
```

Substitua pelo valor da sua chave.

### 3. Executar o projeto

Abra o arquivo:

```text
index.html
```

em um navegador moderno.

### 4. Selecionar uma cidade

Digite, por exemplo:

```text
Sao Paulo
```

Selecione:

```text
BR
```

Clique em:

**Aplicar cidade**

A aplicação fará a consulta à API e apresentará os dados meteorológicos.

## 📡 Integração com ESP32

O projeto foi desenvolvido pensando em um cenário de IoT no qual o **ESP32** pode participar da comunicação MQTT.

O navegador publica informações no broker MQTT e o ESP32 pode se conectar ao mesmo broker para receber ou publicar dados.

Isso permite criar diferentes aplicações, como:

* Monitoramento climático;
* Painéis IoT;
* Estações meteorológicas;
* Automação residencial;
* Sistemas de monitoramento;
* Integração entre sensores e aplicações Web.

## 📚 Conceitos trabalhados

Este projeto pode ser utilizado como atividade prática para estudar:

### API REST

Consumo de serviços externos por meio de requisições HTTP.

### JSON

Manipulação dos dados retornados pela API.

### MQTT

Comunicação baseada em publicação e assinatura (`Publish/Subscribe`).

### IoT

Integração entre software, internet e dispositivos físicos.

### JavaScript

Utilização de:

* `fetch()`;
* `async/await`;
* Eventos;
* DOM;
* Funções;
* Condições;
* Manipulação de dados.

### Visualização de dados

Utilização do Chart.js para representar informações de sensores ou serviços externos em gráficos.

## 🎓 Aplicação educacional

O projeto pode ser utilizado em aulas de:

* Desenvolvimento de Sistemas;
* Programação Web;
* Internet das Coisas;
* APIs;
* JavaScript;
* MQTT;
* Sistemas embarcados;
* Integração de sistemas.

A atividade permite que os alunos visualizem na prática como diferentes tecnologias podem trabalhar de forma integrada em um projeto de IoT.

## 👨‍💻 Autor

**Robson Lourenço**

Projeto desenvolvido para fins educacionais e de aprendizagem em **Desenvolvimento de Sistemas, IoT, APIs e MQTT**.
