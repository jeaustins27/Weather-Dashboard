var searchHistory = [];
var weatherUrl = 'https://api.openweathermap.org';
var apiKey = '2a7e2a8e8fa0fd6ccdaed337094b3fa7';
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var searchHistoryContainer = document.querySelector('#history');


// Function to display past city searches
function displayHistory() {
    searchHistoryContainer.innerHTML = '';
    for (var i = searchHistory.length - 1; i >= 0; i--) {
        var btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('history-btn', 'btn-history');

        btn.setAttribute('city-history', searchHistory[i]);
        btn.textContent = searchHistory[i];
        searchHistoryContainer.append(btn);
    }
}

// Function that adds previous city searches to local storage
function updateHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    }
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    displayHistory();
}

// Function to get previous city searches from local storage
function getHistory() {
    var storedHistory = localStorage.getItem('search-history');
    if (storedHistory) {
        searchHistory = JSON.parse(storedHistory);
    }
    displayHistory();
}

// Function to display the current weather data of the city searched
function currentWeather(city, weather) {
    var date = dayjs().format('M/D/YYYY');
    var temperature = weather.main.temp;
    var windSpeed = weather.wind.speed;
    var humidity = weather.main.humidity;
    // Url to pull weather icon
    var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;

    // Create heading(city), weather icon, temperature, wind speed, and humidity elements
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var heading = document.createElement('h2');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);

    heading.setAttribute('class', 'h3 card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');

    // Adding city and date to the heading
    heading.textContent = `${city} (${date})`;
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('class', 'weather-img');
    
    // Adding the weather icon to the heading
    heading.append(weatherIcon);
    tempEl.textContent = `Temperature: ${temperature}°F`;
    windEl.textContent = `Wind Speed: ${windSpeed} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    // Appending the city, temperature, wind speed, and humidity to the card body
    cardBody.append(heading, tempEl, windEl, humidityEl);

    todayContainer.innerHTML = '';
    todayContainer.append(card);
}

// Function will create a card for the current forecast data
function renderForecastCard(forecast) {
    var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    var temperature = forecast.main.temp;
    var humidity = forecast.main.humidity;
    var windSpeed = forecast.wind.speed;

    // Create elements for a card
    var dayCard = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h4');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    dayCard.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

    dayCard.setAttribute('class', 'col-md');
    dayCard.classList.add('five-day-card');
    card.setAttribute('class', 'card card-bg');
    cardBody.setAttribute('class', 'card-body');
    cardTitle.setAttribute('class', 'card-title');

    // Add content to elements
    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
    weatherIcon.setAttribute('src', iconUrl);
    tempEl.textContent = `Temperature: ${temperature} °F`;
    windEl.textContent = `Wind Speed: ${windSpeed} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    forecastContainer.append(dayCard);
}

// Function to display 5 day forecast.
function renderForecast(dailyForecast) {
    // Time stamps to create a 5 day forecast
    var startDt = dayjs().add(1, 'day').startOf('day').unix();
    var endDt = dayjs().add(6, 'day').startOf('day').unix();

    var headingCol = document.createElement('div');
    var heading = document.createElement('h3');

    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);

    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);

    // For loop that will render the forecast cards for the next 5 days.
    for (var i = 0; i < dailyForecast.length; i++) {
        if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {

            // Only returning data for 12pm
            if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
                renderForecastCard(dailyForecast[i]);
            }
        }
    }
}

// Function to render the current weather and data captured in renderForecast function.
function renderItems(city, data) {
    currentWeather(city, data.list[0], data.city);
    renderForecast(data.list);
}

// Fetch call that will get the coordinates of the city searched
function weatherCall(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;

    var apiUrl = `${weatherUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            renderItems(city, data);
        })
        .catch(function (err) {
            console.error(err);
        });
}

// Fetch call using the city and data from weatherCall() to display the data and adding the city to the search history.
function coordsCall(search) {
    var apiUrl = `${weatherUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`;
    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert('City not found');
            } else {
                updateHistory(search);
                weatherCall(data[0]);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

// Function to handle form submission
function formSubmit(e) {
    if (!searchInput.value) {
        return;
    }
    e.preventDefault();
    var search = searchInput.value.trim();
    coordsCall(search);
    searchInput.value = '';
}

// Function to handle click events on search history buttons
function clickHistory(e) {
    if (!e.target.matches('.btn-history')) {
        return;
    }
    var btn = e.target;
    // Getting the city name from the button attribute to pass through the coordsCall function
    var search = btn.getAttribute('city-history');
    coordsCall(search);
}

// On load, the page will display history from local storage, event listeners available for form submission and search history buttons.
getHistory();
searchForm.addEventListener('submit', formSubmit);
searchHistoryContainer.addEventListener('click', clickHistory);