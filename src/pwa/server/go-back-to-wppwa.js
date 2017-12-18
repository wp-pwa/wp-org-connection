/* eslint-disable */
// Uglify "npx uglify-js static/go-back-to-worona.js --output static/go-back-to-worona.min.js --compress --mangle"
(function(document, window) {
  function showPwaButton() {
    window.scrollTo(0, 0);
    var button = document.createElement("div");
    button.id = "back-to-pwa";
    button.setAttribute(
      "style",
      "width: 55px; height: 55px; position: fixed; bottom: 20px; right: 20px; background-color: rgb(61, 124, 223); border-radius: 50%; box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 10px, rgba(0, 0, 0, 0.23) 0px 3px 10px; display: flex; justify-content: center; align-items: center; z-index: 5000;"
    );

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("height", "90%");
    svg.setAttribute("width", "90%");

    var path1 = document.createElementNS(svg.namespaceURI, "path");
    path1.setAttribute("fill", "white");
    path1.setAttribute(
      "d",
      "M65.4,20H34.6c-1.1,0-2,0.9-2,2v56c0,1.1,0.9,2,2,2h30.8c1.1,0,2-0.9,2-2V22C67.4,20.9,66.5,20,65.4,20z M53,74.7  c0,0.5-0.4,0.9-0.9,0.9h-4.2c-0.5,0-0.9-0.4-0.9-0.9v-4.2c0-0.5,0.4-0.9,0.9-0.9h4.2c0.5,0,0.9,0.4,0.9,0.9V74.7z M64.4,65.2H35.6  V27.9h28.8V65.2z"
    );

    button.addEventListener("click", function() {
      document.cookie = "wppwaClassicVersion=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;";
      window.location.reload(true);
    });

    svg.appendChild(path1);
    button.appendChild(svg);
    document.body.appendChild(button);
  }

  if (document.readyState === "complete") {
    showPwaButton();
  } else {
    window.addEventListener("load", function(event) {
      showPwaButton();
    });
  }
})(document, window);
