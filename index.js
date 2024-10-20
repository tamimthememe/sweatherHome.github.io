const weatherContainer = document.getElementById("weather-container");
const gemini_apiKey = "AIzaSyCLcnKvA1lOV0Rx3lmN2M85qzMYwf8ZIuc";
let mode = "metric";
let url = `https://api.openweathermap.org/data/2.5/forecast?q=London&exclude=hourly,minutely&appid=d66284b13bcf13fd2086b618a3f16642&units=${mode}`;
let tableCondition = "";
const geolocation_apikey = "fbd4032ee8ba4590af11ac745f003b89";

fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${geolocation_apikey}`)
  .then((res) => res.json())
  .then((response) => {
    getData(response.city);
  });

let currentPage = 1;

const nextPage = () => {
  if (currentPage < 3) {
    currentPage++;
    renderTable(tableCondition);
  }
};
const lastPage = () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(tableCondition);
  }
};

$("#searchForm").on("submit", function (e) {
  e.preventDefault();
  $("#chat").append(
    `<div class="flex gap-2 items-end mx-4 max-sm:mr-1 my-4 ml-auto ">
                    <p class="bg-gray-800 rounded-lg rounded-br-none px-4 py-4 max-w-[16rem] max-sm:max-w-[12rem] break-words  max-sm:text-sm ">${e.target.search.value}</p>
                    <div class=" h-12 w-12 flex justify-center items-center rounded-full bg-gray-800 ">
                        <h1 class="text-4xl p-5">T</h1>
                    </div>
                </div>`
  );

  $.ajax({
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCLcnKvA1lOV0Rx3lmN2M85qzMYwf8ZIuc",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `question: ${e.target.search.value}, If the question is not related to weather and its domain, just respond 'I am a weather chatbot! Please ask me a weather related question',`,
            },
          ],
        },
      ],
    }),
    Headers: ["Content-Type: application/json"],
    success: function (response) {
      $("#chat").append(
        `<div class="flex gap-2 items-end mx-4 my-4 max-sm:ml-1 mr-auto">
        <div class=" h-12 w-12 flex justify-center items-center rounded-full bg-blue-400 ">
                            <h1 class="text-4xl p-5">G</h1>
                        </div>
                        <pre class="bg-gray-800 font-sans rounded-lg rounded-br-none px-4 py-4 max-w-[16rem] max-sm:max-w-[12rem] max-sm:text-sm break-words">${response.candidates[0].content.parts[0].text}</pre>
                    </div>`
      );
    },
    function(xhr, status, error) {
      // Handle error response
      console.log(error);
    },
  });
  $("#chat").scrollBottom = $("#chat").scrollHeight;
  e.target.search.value = "";
});

const setTableCondition = (cond) => {
  tableCondition = cond;
  renderTable();
};

const renderTable = () => {
  const date = new Date();
  $.ajax({
    url: url,
    method: "GET",
    success: function (data) {
      console.log(data);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
      let list = data.list.slice(currentPage * 10 + 1, currentPage * 10 + 10);
      if (tableCondition === "lowest") {
        list.sort((a, b) => a.main.temp - b.main.temp);
      } else if (tableCondition === "highest") {
        list.sort((a, b) => b.main.temp - a.main.temp);
      } else if (tableCondition == "rain") {
        list = list.filter((item) => item.weather[0].main === "Rain");
      } else if (tableCondition == "highest temp") {
        item = list.reduce((max, item) =>
          item.main.temp > max.main.temp ? item : max
        );
        list = [item];
      }

      let html = "";
      list.map((item) => {
        html += `<div class="flex ml-3 text-gray-400" >
        <h1 class="py-2 border-b border-gray-400 w-36">${
          days[new Date(item.dt * 1000).getDay()]
        } ${new Date(item.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</h1>
        <h1 class="py-2 border-b border-gray-400 w-36">${item.main.temp}°C</h1>
        <h1 class="py-2 border-b border-gray-400 w-24 max-sm:hidden">${
          item.main.temp_min
        }°C</h1>
        <h1 class="py-2 border-b border-gray-400 w-24 max-sm:hidden">${
          item.main.temp_max
        }°C</h1>
      </div>`;
      });
      $("#table").html(`
        <div class="flex flex-wrap gap-2 justify-between mx-2">
          <h1 class="text-2xl max-sm:text-lg">Weather Forecast</h1>
          <button onclick={setTableCondition("lowest")}>L>H</button>
          <button onclick={setTableCondition("highest")}>H>L</button>
          <button onclick={setTableCondition("rain")}>Rain</button>
          <button onclick={setTableCondition("highest temp")}>H</button>
          <div class="flex gap-2 items-center">
          <p class="text-sm text-gray-400 max-sm:text-xs">${currentPage} / 3</p>
          <button id="before" onclick={lastPage()}>&lt;</button>
          <button id="after" onclick={nextPage()}>&gt;</button>
          </div>
        </div>
        <div class="flex ml-3">
            <h1 class="py-2 border-b-2 w-36">Day</h1>
            <h1 class="py-2 border-b-2 w-36">Temperature</h1>
            <h1 class="py-2 border-b-2 w-24 max-sm:hidden">Minimum</h1>
            <h1 class="py-2 border-b-2 w-24 max-sm:hidden">Maximum</h1>
          </div>          
          ${html}`);
    },
  });
};


const getCharts = async () => {
  $.ajax({
    url: url,
    method: "GET",
    success: function (data) {
      const listData = data.list.slice(0, 5);
      let labels = [];
      let tempDatasets = [];
      let weather = [];
      listData.map((item) => {
        labels.push(new Date(item.dt * 1000).toLocaleTimeString());
        tempDatasets.push(item.main.temp);
        weather.push(item.weather[0].description);
      });
      let chartData = {
        labels: labels,
        datasets: [
          {
            label: "Temperature",
            data: tempDatasets,
            backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue bars
            borderColor: "rgba(54, 162, 235, 1)", // Blue border
            borderWidth: 1,
          },
        ],
      };

      const config = {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false, // Allows you to set a specific height and width
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      };

      const configDoughnut = {
        type: "doughnut",
        data: {
          labels: Object.keys(
            weather.reduce((weat, reason) => {
              weat[reason] = (weat[reason] || 0) + 1;
              return weat;
            }, {})
          ),
          datasets: [
            {
              label: "Weather",
              data: Object.values(
                weather.reduce((weat, reason) => {
                  weat[reason] = (weat[reason] || 0) + 1;
                  return weat;
                }, {})
              ),
              backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue bars
              borderColor: "rgba(54, 162, 235, 1)", // Blue border
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      };

      const configLine = {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
        },
      };

      new Chart(document.getElementById("myChart"), config);
      new Chart(document.getElementById("doughnutChart"), configDoughnut);
      new Chart(document.getElementById("lineChart"), configLine);
    },
  });
};

const getData = (value) => {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?q=${value}&appid=d66284b13bcf13fd2086b618a3f16642&units=metric`,
    method: "GET",
    success: function (response) {
      $("#weather-container").html(
        `
        <div class="flex gap-4 flex-wrap">
                <div
                  class="bg-gray-800 w-[50rem] max-md:w-[20rem] p-6 rounded-xl mt-3 group"
                >
                  <p class="my-2">Location: ${response.name}</p>
                  <div class="flex justify-between flex-wrap gap-4">
                    <div class="">
                      <h1 class="text-4xl">${response.weather[0].main}</h1>
                      <p
                        class="font-light mt-2 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-all duration-300 text-gray-400"
                      >
                        ${response.weather[0].description}
                      </p>
                      <div
                        class="flex gap-2 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-all duration-300 text-gray-400"
                      >
                        <p class="font-light">${response.coord.lat} N</p>
                        <p class="font-light">${response.coord.lon} E</p>
                      </div>
                    </div>
                    <div>
                      <h1 class="text-right text-4xl max-md:text-left">
                        ${response.main.temp} °C
                      </h1>
                      <div
                        class="flex gap-2 mt-2 max-md:opacity-100 opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-400"
                      >
                        <p>min: ${response.main.temp_min}°C</p>
                        <p>max: ${response.main.temp_max}°C</p>
                      </div>
                      <p
                        class="opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-all duration-300 text-gray-400"
                      >
                        Humdity: ${response.main.humidity}%
                      </p>
                      <p
                        class="opacity-0 max-md:opacity-100 group-hover:opacity-100 transition-all duration-300 text-gray-400"
                      >
                        Visibility: ${response.visibility}
                      </p>
                    </div>
                  </div>
                  <h1 class="text-4xl mt-2">Wind</h1>
                  <p
                    class="mt-2 opacity-0 max-md:opacity-100 group-hover:opacity-100 transition-all duration-300 text-gray-400"
                  >
                    speed: ${response.wind.speed} mph
                  </p>
                  <p
                    class="opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-all duration-300 text-gray-400"
                  >
                    deg: ${response.wind.deg}°
                  </p>
                </div>
                <canvas id="doughnutChart" class="dg"></canvas>
              </div>

              <div class="flex gap-4 flex-wrap items-center max-md:pb-8">
                <canvas id="myChart" class="vbg"></canvas>
                <canvas id="lineChart" class="lc"></canvas>
              </div>
              `
      );

      getCharts();

      renderTable();
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        $("#weather-container").html(
          "<p>City not found. Please check the name and try again.</p>"
        );
      }
    },
  });
};

$("#form").on("submit", function (e) {
  e.preventDefault();
  getData(e.target.city.value);
});
