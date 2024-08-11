routeArr = [];

const busInput = document.querySelector("#busInput");
const searchBtn = document.querySelector("#searchBtn");
const directionBox = document.querySelector("#directionBox");
const stopBoxList = document.querySelector("#stopBoxList");
const busImg = document.querySelector("#loader");

// Hide the bus loading screen from the beginning
function hideBus() {
  busImg.style.display = "none";
}

hideBus();

let stopLi;
let choosenBound;
let choosenServiceType;
let choose;
let busInputValue;

searchBtn.addEventListener("click", () => {
  const directionBtn = document.querySelectorAll(".directionBtn");
  for (let i = 0; i < directionBtn.length; i++) {
    directionBtn[i].remove();
  }

  stopLi = document.querySelectorAll(".stopLi");
  for (let i = 0; i < stopLi.length; i++) {
    stopLi[i].remove();
  }

  busInputValue = busInput.value.replace(/\s/g, "").toUpperCase();
  console.log(busInputValue);

  async function fetchRouteListData() {
    const res = await fetch(
      "https://data.etabus.gov.hk/v1/transport/kmb/route/"
    );
    const dataRoute = await res.json();
    const busArr = dataRoute["data"];

    // Push all the directions of user chosen route
    for (let i = 0; i < busArr.length; i++) {
      routeArr.push(busArr[i]["route"]);
      if (busInputValue == busArr[i]["route"]) {
        const newBtn = document.createElement("button");
        newBtn.classList.add("directionBtn");
        newBtn.classList.add("button-81");
        newBtn.append(`${busArr[i]["orig_tc"]} > ${busArr[i]["dest_tc"]}`);
        directionBox.append(newBtn);
      }
    }

    // Check if user input is valid
    if (routeArr.indexOf(busInputValue) < 0) {
      alert("Invalid route / Please fill in this field");
    }

    // Finding the bound and service type when user click the direction
  }
  fetchRouteListData();
});

directionBox.addEventListener("click", (event) => {
  // Clearing the stop list from previous search
  stopLi = document.querySelectorAll(".stopLi");
  for (let i = 0; i < stopLi.length; i++) {
    stopLi[i].remove();
  }
  // Showing the bus loading screen for 2s
  busImg.style.display = "block";
  setTimeout(hideBus, 1000);
  setTimeout(async () => {
    async function fetchRouteListData() {
      const res = await fetch(
        "https://data.etabus.gov.hk/v1/transport/kmb/route/"
      );
      const dataRoute = await res.json();
      const busArr = dataRoute["data"];

      if (event.target.classList.contains("directionBtn")) {
        choose = event.target.textContent.split(" ");
        console.log(choose[0], choose[2]);

        for (let i = 0; i < busArr.length; i++) {
          if (
            busInputValue == busArr[i]["route"] &&
            choose[0] == busArr[i]["orig_tc"] &&
            choose[2] == busArr[i]["dest_tc"]
          ) {
            choosenBound = busArr[i]["bound"];
            choosenServiceType = busArr[i]["service_type"];
          }
        }
      }

      // Once directionBtn is clicked, clear the previous li inside

      // stopLi = document.querySelectorAll(".stopLi");
      // for (let i = 0; i < stopLi.length; i++) {
      //   stopLi[i].remove();
      // }

      async function fetchRouteStopListData() {
        const res = await fetch(
          "https://data.etabus.gov.hk/v1/transport/kmb/route-stop"
        );
        const dataStop = await res.json();
        const stopArr = dataStop["data"];
        for (let i = 0; i < stopArr.length; i++) {
          if (
            busInputValue == stopArr[i]["route"] &&
            choosenBound == stopArr[i]["bound"] &&
            choosenServiceType == stopArr[i]["service_type"]
          ) {
            async function fetchStopListData() {
              const res = await fetch(
                "https://data.etabus.gov.hk/v1/transport/kmb/stop"
              );
              const dataStopName = await res.json();
              const nameArr = dataStopName["data"];

              for (let j = 0; j < nameArr.length; j++) {
                if (nameArr[j]["stop"] == stopArr[i]["stop"]) {
                  const newContent = document.createElement("div");
                  newContent.classList.add("content");
                  const newLi = document.createElement("li");
                  newLi.classList.add("stopLi");
                  const newStopName = document.createElement("div");
                  newStopName.classList.add("stopName");
                  newStopName.append(nameArr[j]["name_tc"]);
                  newLi.append(newStopName);
                  newLi.append(newContent);
                  stopBoxList.append(newLi);
                  console.log(newLi);

                  // ETA API

                  async function fetchEtaData(stopId, route, serviceType) {
                    const res = await fetch(
                      "https://data.etabus.gov.hk/v1/transport/kmb/eta/" +
                        stopId +
                        "/" +
                        route +
                        "/" +
                        serviceType
                    );
                    const dataEta = await res.json();
                    const etaArr = dataEta["data"];

                    for (let k = 0; k < etaArr.length; k++) {
                      if (
                        choosenBound == etaArr[k]["dir"] &&
                        etaArr[k]["eta_seq"] == 1 &&
                        etaArr[k]["seq"] == stopArr[i]["seq"]
                      ) {
                        const newEta1 = document.createElement("div");
                        newEta1.classList.add("eta1");
                        const newP = document.createElement("p");
                        if (etaArr[k]["rmk_tc"] == "") {
                          newP.append("實時班次");
                          newP.style.backgroundColor = "#9AD0C2";
                        } else {
                          newP.append(etaArr[k]["rmk_tc"]);
                          newP.style.backgroundColor = "#BBC3A4";
                        }
                        newEta1.append(etaArr[k]["eta"].slice(11, 16));
                        newEta1.append(newP);
                        newContent.append(newEta1);
                      } else if (
                        choosenBound == etaArr[k]["dir"] &&
                        etaArr[k]["eta_seq"] == 2 &&
                        etaArr[k]["seq"] == stopArr[i]["seq"]
                      ) {
                        const newEta2 = document.createElement("div");
                        newEta2.classList.add("eta2");
                        const newP = document.createElement("p");
                        if (etaArr[k]["rmk_tc"] == "") {
                          newP.append("實時班次");
                          newP.style.backgroundColor = "#9AD0C2";
                        } else {
                          newP.append(etaArr[k]["rmk_tc"]);
                          newP.style.backgroundColor = "#BBC3A4";
                        }
                        newEta2.append(etaArr[k]["eta"].slice(11, 16));
                        newEta2.append(newP);
                        newContent.append(newEta2);
                      } else if (
                        choosenBound == etaArr[k]["dir"] &&
                        etaArr[k]["eta_seq"] == 3 &&
                        etaArr[k]["seq"] == stopArr[i]["seq"]
                      ) {
                        const newEta3 = document.createElement("div");
                        newEta3.classList.add("eta3");
                        const newP = document.createElement("p");
                        if (etaArr[k]["rmk_tc"] == "") {
                          newP.append("實時班次");
                          newP.style.backgroundColor = "#9AD0C2";
                        } else {
                          newP.append(etaArr[k]["rmk_tc"]);
                          newP.style.backgroundColor = "#BBC3A4";
                        }
                        newEta3.append(etaArr[k]["eta"].slice(11, 16));
                        newEta3.append(newP);
                        newContent.append(newEta3);
                      }
                    }
                  }
                  fetchEtaData(
                    stopArr[i]["stop"],
                    busInputValue,
                    choosenServiceType
                  );
                }
              }
            }
            fetchStopListData();
          }
        }
      }
      fetchRouteStopListData();
    }

    fetchRouteListData();
  }, 1000);
});

// Functional JS

// const stopName = document.querySelectorAll(".stopName");
// const contentBox = document.querySelectorAll(".content");
// const collapseBtn = document.querySelectorAll(".collapseBtn");

// function hideContent() {
//   for (let i = 0; i < contentBox.length; i++) {
//     contentBox[i].style.display = "none";
//   }
// }
// hideContent();

// for (let i = 0; i < stopName.length; i++) {
//   stopName[i].addEventListener("click", () => {
//     stopName[i].nextElementSibling.style.display = "block";
//   });
// }

// for (let i = 0; collapseBtn.length; i++) {
//   collapseBtn[i].addEventListener("click", () => {
//     collapseBtn[i].parentElement.parentElement.style.display = "none";
//   });
// }
