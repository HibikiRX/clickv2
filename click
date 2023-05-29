<!DOCTYPE html>
<html>
<head>
  <title>Compteur avec décompte</title>
  <style>
    body {
      background-image: url('https://w.forfun.com/fetch/44/44ee59ccf3674b528672a2108767630f.jpeg');
      background-size: cover;
      background-repeat: no-repeat;
      text-align: center;
      font-size: 48px;
      color: white;
      margin-top: 200px;
    }

    img {
      cursor: pointer;
    }
  </style>
  <script>
    var counter = 60;
    var clicks = 0;

    function countdown() {
      var countdownDisplay = document.getElementById('countdown');
      var clicksDisplay = document.getElementById('clicks');
      countdownDisplay.innerHTML = counter.toFixed(1);
      clicksDisplay.innerHTML = clicks;

      if (counter <= 0) {
        counter = 60;
        clicks = 0;
      } else {
        counter -= 0.1;
      }
    }

    function handleClick() {
      clicks++;
    }

    setInterval(countdown, 100);

  </script>
</head>
<body>
  <div id="countdown">60.0</div>
  <div>Nombre de clics : <span id="clicks">0</span></div>
  <img src="https://static.cnews.fr/sites/default/files/web_19453059.jpg-r_1920_1080-f_jpg-q_x-xxyxx_copie_642d407507bed.jpg" onclick="handleClick()" alt="Cliquez ici">
</body>
</html>
