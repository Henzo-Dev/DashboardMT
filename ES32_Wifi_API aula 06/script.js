
// Configure sua chave do OpenWeatherMap antes de executar.
const OPENWEATHER_API_KEY = "0cb7fea0cbc1ad53bf005cf807b9f0c4";
const MQTT_BROKER = "ws://broker.hivemq.com:8000/mqtt";

const TOPICOS = {
  temperatura: "esp32/clima/temperatura",
  umidade: "esp32/clima/umidade",
  cidadeAtual: "esp32/clima/cidadeAtual",
  cidade: "esp32/clima/cidade"
};

const CHAVE_HISTORICO = "dashboardClimaHistorico";
const CHAVE_FAVORITA = "dashboardClimaFavorita";
const CHAVE_TEMA = "dashboardClimaTema";
const $ = id => document.getElementById(id);

let climaAtual = null;
let historico = carregarLocal(CHAVE_HISTORICO, []);

// GRÁFICO
const grafico = new Chart($("grafico"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperatura (°C)",
        data: [],
        borderColor: "#e34b4b",
        backgroundColor: "rgba(227, 75, 75, .12)",
        yAxisID: "temperatura",
        tension: .3
      },
      {
        label: "Sensação térmica (°C)",
        data: [],
        borderColor: "#ef9b27",
        backgroundColor: "rgba(239, 155, 39, .10)",
        yAxisID: "temperatura",
        tension: .3
      },
      {
        label: "Umidade (%)",
        data: [],
        borderColor: "#3b82e5",
        backgroundColor: "rgba(59, 130, 229, .10)",
        yAxisID: "umidade",
        tension: .3
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: {
        title: { display: true, text: "Horário" }
      },
      temperatura: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Temperatura (°C)" }
      },
      umidade: {
        type: "linear",
        position: "right",
        min: 0,
        max: 100,
        title: { display: true, text: "Umidade (%)" },
        grid: { drawOnChartArea: false }
      }
    }
  }
});

// CONEXÃO MQTT
let mqttClient = null;

try {
  if (typeof mqtt !== "undefined") {
    mqttClient = mqtt.connect(MQTT_BROKER, {
      reconnectPeriod: 3000,
      connectTimeout: 10000
    });

    mqttClient.on("connect", () => {
      setStatusMQTT("Conectado");

      mqttClient.subscribe(
        [
          TOPICOS.temperatura,
          TOPICOS.umidade,
          TOPICOS.cidadeAtual
        ],
        erro => {
          if (erro) console.error("Erro ao assinar tópicos MQTT:", erro);
        }
      );
    });

    mqttClient.on("reconnect", () => setStatusMQTT("Reconectando..."));
    mqttClient.on("offline", () => setStatusMQTT("Offline"));
    mqttClient.on("close", () => setStatusMQTT("Desconectado"));

    mqttClient.on("error", erro => {
      console.error("Erro MQTT:", erro);
      setStatusMQTT("Erro na conexão");
    });

    mqttClient.on("message", (topico, mensagem) => {
      const valor = mensagem.toString();

      if (
        topico === TOPICOS.temperatura &&
        Number.isFinite(Number(valor))
      ) {
        $("temp").textContent = `${Number(valor).toFixed(1)} °C`;
      } else if (
        topico === TOPICOS.umidade &&
        Number.isFinite(Number(valor))
      ) {
        $("hum").textContent = `${Number(valor)} %`;
      } else if (topico === TOPICOS.cidadeAtual) {
        $("cidadeAtual").textContent = valor;
      }
    });
  } else {
    setStatusMQTT("Biblioteca indisponível");
  }
} catch (erro) {
  console.error("Não foi possível iniciar MQTT:", erro);
  setStatusMQTT("Indisponível");
}

function setStatusMQTT(texto) {
  $("statusMQTT").textContent = texto;
}

// FUNÇÕES AUXILIARES
function mostrarMensagem(texto, tipo = "") {
  const elemento = $("mensagem");
  elemento.textContent = texto;
  elemento.className = tipo;
}

function carregarLocal(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch {
    return padrao;
  }
}

function salvarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn("Não foi possível salvar no navegador:", erro);
  }
}

function direcaoDoVento(graus) {
  if (typeof graus !== "number") return "—";

  const direcoes = [
    "N", "NNE", "NE", "ENE", "L", "ESE", "SE", "SSE",
    "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"
  ];

  return direcoes[
    Math.round((((graus % 360) + 360) % 360) / 22.5) % 16
  ];
}

// EXIBIR DADOS METEOROLÓGICOS
function exibirClima(dados) {
  $("cidadeAtual").textContent = `${dados.name}, ${dados.sys.country}`;
  $("condicao").textContent =
    dados.weather?.[0]?.description || "Condição não informada";

  $("temp").textContent = `${dados.main.temp.toFixed(1)} °C`;
  $("hum").textContent = `${dados.main.humidity} %`;
  $("sensacao").textContent = `${dados.main.feels_like.toFixed(1)} °C`;
  $("vento").textContent = `${(dados.wind.speed * 3.6).toFixed(1)} km/h`;
  $("direcaoVento").textContent = direcaoDoVento(dados.wind.deg);
  $("pressao").textContent = `${dados.main.pressure} hPa`;

  $("minmax").textContent =
    `Mín.: ${dados.main.temp_min.toFixed(1)} °C | ` +
    `Máx.: ${dados.main.temp_max.toFixed(1)} °C`;

  $("atualizacao").textContent = new Date().toLocaleString("pt-BR");
}

// ATUALIZAR GRÁFICO
function atualizarGrafico(dados) {
  const hora = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  grafico.data.labels.push(hora);
  grafico.data.datasets[0].data.push(dados.main.temp);
  grafico.data.datasets[1].data.push(dados.main.feels_like);
  grafico.data.datasets[2].data.push(dados.main.humidity);

  while (grafico.data.labels.length > 10) {
    grafico.data.labels.shift();
    grafico.data.datasets.forEach(dataset => dataset.data.shift());
  }

  grafico.update();
}

// NOVA FUNCIONALIDADE: ALERTAS CLIMÁTICOS
function verificarAlertas(dados) {
  const temperatura = dados.main.temp;
  const umidade = dados.main.humidity;
  const ventoKmh = dados.wind.speed * 3.6;
  const alertas = [];

  if (temperatura >= 35) {
    alertas.push("🔥 Temperatura muito elevada.");
  }

  if (temperatura <= 10) {
    alertas.push("❄️ Temperatura baixa.");
  }

  if (ventoKmh >= 40) {
    alertas.push("💨 Vento forte.");
  }

  if (umidade <= 30) {
    alertas.push("🏜️ Umidade do ar muito baixa.");
  }

  if (umidade >= 90) {
    alertas.push("💧 Umidade do ar muito alta.");
  }

  const caixa = $("alerta");

  if (alertas.length) {
    caixa.textContent = alertas.join(" ");
    caixa.classList.add("warning");
  } else {
    caixa.textContent =
      "✅ Condições sem alertas importantes pelos limites definidos no projeto.";
    caixa.classList.remove("warning");
  }
}

// PUBLICAR DADOS PELO MQTT
function publicarMQTT(dados) {
  if (!mqttClient || !mqttClient.connected) {
    $("ultimaPublicacao").textContent =
      "Não publicada: MQTT desconectado";
    return false;
  }

  const mensagens = [
    [TOPICOS.temperatura, String(dados.main.temp)],
    [TOPICOS.umidade, String(dados.main.humidity)],
    [
      TOPICOS.cidadeAtual,
      `${dados.name}, ${dados.sys.country}`
    ],
    [TOPICOS.cidade, `${dados.name},${dados.sys.country}`]
  ];

  mensagens.forEach(([topico, valor]) => {
    mqttClient.publish(topico, valor, { qos: 0 }, erro => {
      if (erro) {
        console.error(`Erro ao publicar em ${topico}:`, erro);
      }
    });
  });

  $("ultimaPublicacao").textContent =
    new Date().toLocaleTimeString("pt-BR");

  return true;
}

// HISTÓRICO DE CONSULTAS
function adicionarHistorico(dados) {
  const registro = {
    cidade: dados.name,
    pais: dados.sys.country,
    temperatura: dados.main.temp,
    umidade: dados.main.humidity,
    horario: new Date().toISOString()
  };

  historico = [
    registro,
    ...historico.filter(item =>
      !(item.cidade === registro.cidade && item.pais === registro.pais)
    )
  ].slice(0, 5);

  salvarLocal(CHAVE_HISTORICO, historico);
  renderizarHistorico();
}

function renderizarHistorico() {
  const caixa = $("historico");
  caixa.replaceChildren();

  if (!historico.length) {
    const vazio = document.createElement("p");
    vazio.className = "empty";
    vazio.textContent = "Nenhuma consulta realizada.";
    caixa.appendChild(vazio);
    return;
  }

  historico.forEach(item => {
    const linha = document.createElement("div");
    linha.className = "history-item";

    const detalhes = document.createElement("p");
    const nome = document.createElement("strong");
    nome.textContent = `${item.cidade}, ${item.pais}`;

    const quebra = document.createElement("br");
    const resumo = document.createElement("small");
    resumo.textContent =
      `${Number(item.temperatura).toFixed(1)} °C • ` +
      `${item.umidade}% de umidade`;

    detalhes.append(nome, quebra, resumo);

    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = "Consultar";

    botao.addEventListener("click", () => {
      $("cidade").value = item.cidade;
      $("pais").value = item.pais;
      consultarClima();
    });

    linha.append(detalhes, botao);
    caixa.appendChild(linha);
  });
}

// CIDADE FAVORITA
function renderizarFavorita() {
  const favorita = carregarLocal(CHAVE_FAVORITA, null);

  $("favoritaTexto").textContent = favorita
    ? `${favorita.cidade}, ${favorita.pais}`
    : "Nenhuma cidade favorita salva.";
}

// CONSULTA À API
async function consultarClima() {
  const cidade = $("cidade").value.trim();
  const pais = $("pais").value;

  if (!cidade) {
    mostrarMensagem("Digite o nome de uma cidade.", "erro");
    $("cidade").focus();
    return;
  }

  if (
    !OPENWEATHER_API_KEY ||
    OPENWEATHER_API_KEY === "COLE_SUA_CHAVE_AQUI"
  ) {
    mostrarMensagem(
      "Configure sua API Key no arquivo script.js.",
      "erro"
    );
    return;
  }

  $("consultar").disabled = true;
  $("loading").classList.add("show");
  mostrarMensagem("");

  try {
    const parametros = new URLSearchParams({
      q: `${cidade},${pais}`,
      appid: OPENWEATHER_API_KEY,
      units: "metric",
      lang: "pt_br"
    });

    const resposta = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${parametros}`
    );

    if (!resposta.ok) {
      let detalhe = {};

      try {
        detalhe = await resposta.json();
      } catch {
        // A resposta pode não conter JSON.
      }

      if (resposta.status === 404) {
        throw new Error(
          "Cidade não encontrada. Confira o nome e o país."
        );
      }

      if (resposta.status === 401) {
        throw new Error("API Key inválida ou ainda não ativada.");
      }

      if (resposta.status === 429) {
        throw new Error(
          "Limite de consultas da API atingido. Tente novamente depois."
        );
      }

      throw new Error(
        detalhe.message ||
        `Não foi possível consultar o clima (erro ${resposta.status}).`
      );
    }

    const dados = await resposta.json();

    climaAtual = dados;
    exibirClima(dados);
    atualizarGrafico(dados);
    verificarAlertas(dados);
    adicionarHistorico(dados);

    const mqttEnviado = publicarMQTT(dados);

    mostrarMensagem(
      mqttEnviado
        ? `Consulta de ${dados.name} concluída e dados enviados pelo MQTT.`
        : `Consulta de ${dados.name} concluída. O MQTT está desconectado; os dados não foram publicados.`,
      mqttEnviado ? "sucesso" : ""
    );

  } catch (erro) {
    console.error("Erro na consulta meteorológica:", erro);

    mostrarMensagem(
      !navigator.onLine
        ? "Sem conexão com a internet. Verifique sua rede."
        : erro.message,
      "erro"
    );

  } finally {
    $("consultar").disabled = false;
    $("loading").classList.remove("show");
  }
}

// FORMULÁRIO DE PESQUISA
$("formClima").addEventListener("submit", evento => {
  evento.preventDefault();
  consultarClima();
});

// SALVAR FAVORITA
$("salvarFavorita").addEventListener("click", () => {
  if (!climaAtual) {
    mostrarMensagem(
      "Consulte uma cidade antes de salvá-la como favorita.",
      "erro"
    );
    return;
  }

  salvarLocal(CHAVE_FAVORITA, {
    cidade: climaAtual.name,
    pais: climaAtual.sys.country
  });

  renderizarFavorita();
  mostrarMensagem("Cidade favorita salva no navegador.", "sucesso");
});

// CONSULTAR FAVORITA
$("consultarFavorita").addEventListener("click", () => {
  const favorita = carregarLocal(CHAVE_FAVORITA, null);

  if (!favorita) {
    mostrarMensagem(
      "Você ainda não salvou uma cidade favorita.",
      "erro"
    );
    return;
  }

  $("cidade").value = favorita.cidade;
  $("pais").value = favorita.pais;
  consultarClima();
});

// REMOVER FAVORITA
$("removerFavorita").addEventListener("click", () => {
  localStorage.removeItem(CHAVE_FAVORITA);
  renderizarFavorita();
  mostrarMensagem("Cidade favorita removida.", "sucesso");
});

// MODO CLARO E ESCURO
function aplicarTema() {
  const escuro = localStorage.getItem(CHAVE_TEMA) === "escuro";

  document.body.classList.toggle("dark", escuro);

  $("alternarTema").textContent = escuro
    ? "☀️ Modo claro"
    : "🌙 Modo escuro";

  const corTexto = escuro ? "#edf3ff" : "#344054";
  const corGrade = escuro
    ? "rgba(220,230,245,.12)"
    : "rgba(52,64,84,.12)";

  grafico.options.plugins.legend.labels.color = corTexto;

  Object.values(grafico.options.scales).forEach(eixo => {
    if (eixo.ticks) eixo.ticks.color = corTexto;
    if (eixo.title) eixo.title.color = corTexto;
    if (eixo.grid) eixo.grid.color = corGrade;
  });

  grafico.update();
}

$("alternarTema").addEventListener("click", () => {
  const temaAtual =
    localStorage.getItem(CHAVE_TEMA) === "escuro"
      ? "claro"
      : "escuro";

  localStorage.setItem(CHAVE_TEMA, temaAtual);
  aplicarTema();
});

// INICIALIZAÇÃO
renderizarHistorico();
renderizarFavorita();
aplicarTema();
