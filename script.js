// Save complaint
document.addEventListener("DOMContentLoaded", function () {
        
    const form = document.getElementById("complaintForm");
    const table = document.getElementById("complaintTable");

    let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            let name = document.getElementById("name").value || "Anonymous";
            let type = document.getElementById("type").value;
            let description = document.getElementById("description").value;
            let evidenceFile = document.getElementById("evidence").files[0];
            let evidenceName = evidenceFile ? evidenceFile.name : "No File";
            let aiCategory = classifyComplaint(description);
            let riskScore = Math.floor(Math.random() * 40) + 60;
            let trackingID = "SH-" + Date.now().toString().slice(-6);
            let complaint = {
    name: name,
    type: type,
    description: description,
    location: document.getElementById("location").value,
    emergency: document.getElementById("emergencyToggle").checked ? "YES" : "NO",
    liveLocation: liveLocation,
    evidence: evidenceName,
    aiCategory: aiCategory,
    riskScore: riskScore,
    trackingID: trackingID,
    mapsLink: mapsLink,
    status: "Pending",
    time: new Date().toLocaleString()
};

        
            complaints.push(complaint);
            localStorage.setItem("complaints", JSON.stringify(complaints));
               let recommendation = "";

if (aiCategory === "Harassment") {
    recommendation = "Recommended: Contact HR or trusted authority.";
}
else if (aiCategory === "High Priority") {
    recommendation = "Recommended: Contact emergency helpline immediately.";
}
else if (aiCategory === "Discrimination") {
    recommendation = "Recommended: Report to institutional grievance cell.";
}

// Reset live location after saving
liveLocation = "Not Shared";
mapsLink = "";

// Show success message
document.getElementById("message").innerText =
"Complaint Submitted!\nTracking ID: " + trackingID +
"\nAI Category: " + aiCategory +
"\n" + recommendation;
        });
    }
 
 if (table) {
    

    table.innerHTML = ""; // clear table first
    complaints.forEach((c, index) => {
    let rowClass = c.emergency === "YES" ? "high-priority" : "";
        let row = `
            <tr class="${rowClass}">
                <td>${c.name}</td>
                <td>${c.type}</td>
                <td>${c.location || "Not Provided"}</td>
                <td>${c.emergency || "NO"}</td>
                <td>${c.mapsLink ? `<a href="${c.mapsLink}" target="_blank">View Map</a>` : "Not Shared"}</td>
                <td>${c.evidence}</td>
                <td>${c.aiCategory}</td>
                <td>${c.riskScore ? c.riskScore + "%" : Math.floor(Math.random() * 40 + 60) + "%"}</td>
                <td>${c.trackingID}</td>
                <td>
                    <select onchange="updateStatus(${index}, this.value)">
                        <option value="Pending" ${c.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Under Review" ${c.status === "Under Review" ? "selected" : ""}>Under Review</option>
                        <option value="Resolved" ${c.status === "Resolved" ? "selected" : ""}>Resolved</option>
                    </select>
                    <br>
                    <button onclick="deleteComplaint(${index})">Delete</button>
                </td>
                <td>${c.time || "Old Data"}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
 }
    updateSummary(complaints);
    loadChart(complaints);
    loadTrendChart(complaints);
 });


// Basic AI Classification
function classifyComplaint(text) {
    text = text.toLowerCase();

    if (text.includes("threat") || text.includes("unsafe")) {
        return "High Priority";
    }
    else if (text.includes("comment") || text.includes("touch")) {
        return "Harassment";
    }
    else if (text.includes("bias") || text.includes("promotion")) {
        return "Discrimination";
    }
    else {
        return "General Review";
    }
}
function loadChart(complaints) {

    let counts = {
        "High Priority": 0,
        "Harassment": 0,
        "Discrimination": 0,
        "General Review": 0
    };

    complaints.forEach(c => {
        if (counts[c.aiCategory] !== undefined) {
            counts[c.aiCategory]++;
        }
    });

    const ctx = document.getElementById('complaintChart');

   if (!ctx) return;

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: Object.keys(counts),
        datasets: [{
            label: "Total Complaints: " + complaints.length,
            data: Object.values(counts),
            backgroundColor: [
                "#ff4d4d",   // High Priority - Red
                "#ffb84d",   // Harassment - Orange
                "#4da6ff",   // Discrimination - Blue
                "#66cc66"    // General Review - Green
            ],
            borderRadius: 8
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});
}

function animateCounter(id, target) {
    let element = document.getElementById(id);
    let count = 0;
    let increment = Math.ceil(target / 40);

    let interval = setInterval(() => {
        count += increment;
        if (count >= target) {
            count = target;
            clearInterval(interval);
        }
        element.innerText = count;
    }, 30);
}

function updateSummary(complaints) {

    let total = complaints.length;
    let high = complaints.filter(c => c.aiCategory === "High Priority").length;
    let resolved = complaints.filter(c => c.status === "Resolved").length;

    animateCounter("totalCount", total);
    animateCounter("highCount", high);
    animateCounter("resolvedCount", resolved);
}
function toggleChat() {
    const chatbox = document.getElementById("chatbox");
    chatbox.style.display = 
        chatbox.style.display === "flex" ? "none" : "flex";
}

function sendMessage() {
    let input = document.getElementById("userInput");
    let message = input.value.trim();
    if (!message) return;

    const chatBody = document.getElementById("chatBody");

    // Show user message
    chatBody.innerHTML += 
        `<div class="user-message">${message}</div>`;

    input.value = "";

    // Bot response
    let response = getBotResponse(message);

    setTimeout(() => {
        chatBody.innerHTML += 
            `<div class="bot-message">${response}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 500);
}
function startVoice() {
    const SpeechRecognition = 
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice recognition not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = function () {
        console.log("Voice recognition started...");
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("userInput").value = transcript;
    };

    recognition.onerror = function (event) {
        console.error("Voice error:", event.error);
    };

    recognition.start();
}
function getBotResponse(message) {
    message = message.toLowerCase();

    // Safety Check
    if (message.includes("unsafe") || message.includes("danger") || message.includes("emergency")) {
        return "If you are in immediate danger, please contact campus security or local emergency services immediately. Your safety is the top priority.";
    }

    // Reporting Help
    else if (message.includes("how to report") || message.includes("report complaint")) {
        return "You can submit a confidential complaint through the Report page. You may remain anonymous if you prefer.";
    }

    // Confidentiality
    else if (message.includes("anonymous") || message.includes("confidential")) {
        return "Yes 💜 Secure HER AI allows anonymous reporting. Your identity will not be revealed without your consent.";
    }

    // Fear / Retaliation
    else if (message.includes("afraid") || message.includes("fear") || message.includes("retaliation")) {
        return "It is completely valid to feel that way. Our platform ensures confidentiality and structured follow-up to reduce fear of retaliation.";
    }

    // Status Tracking
    else if (message.includes("track") || message.includes("status")) {
        return "After submitting a complaint, administrators can update the status (Pending, Under Review, Resolved). You can check updates in the dashboard.";
    }

    // Evidence Upload
    else if (message.includes("evidence") || message.includes("proof")) {
        return "You may upload supporting evidence while submitting your complaint to help authorities investigate effectively.";
    }

    // Harassment Info
    else if (message.includes("harassment")) {
        return "Harassment includes unwanted comments, actions, or behavior that make someone feel uncomfortable or unsafe.";
    }

    // Discrimination Info
    else if (message.includes("discrimination")) {
        return "Discrimination refers to unfair treatment based on gender, identity, background, or other personal characteristics.";
    }

    // Bullying Info
    else if (message.includes("bullying")) {
        return "Bullying includes repeated harmful behavior such as intimidation, humiliation, or verbal abuse.";
    }

    // Emotional Support
    else if (message.includes("sad") || message.includes("stressed") || message.includes("anxious")) {
        return "I’m really sorry you're feeling that way 💜 You’re not alone. Would you like help submitting a report or finding support resources?";
    }

    // Greeting
    else if (message.includes("hi") || message.includes("hello")) {
        return "Hello 💜 I’m here to support you. How can I help you today?";
    }

    // Default Response
    else {
        return "I'm here to support you. You can ask about reporting, confidentiality, complaint types, or emotional support.";
    }
}
function updateStatus(index, newStatus) {
    let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    complaints[index].status = newStatus;
    localStorage.setItem("complaints", JSON.stringify(complaints));

    logAction("Status updated for complaint #" + index + " to " + newStatus);
}
function deleteComplaint(index) {
    let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

    complaints.splice(index, 1);

    localStorage.setItem("complaints", JSON.stringify(complaints));

    location.reload();
}
function adminLogin() {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if (user === "admin" && pass === "1234") {
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("loginMessage").innerText =
            "Invalid credentials!";
    }
}
let liveLocation = "Not Shared";
let mapsLink = "";

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {

            let lat = position.coords.latitude.toFixed(4);
            let lng = position.coords.longitude.toFixed(4);

            liveLocation = "Lat: " + lat + ", Lng: " + lng;
            mapsLink = "https://www.google.com/maps?q=" + lat + "," + lng;

            document.getElementById("liveLocationText").innerText =
                "Live Location Shared ✅";
        });
    }
}
function loadTrendChart(complaints) {

    let monthCounts = {};

    complaints.forEach(c => {
        let month = new Date(c.time).toLocaleString("default", { month: "short" });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const ctx = document.getElementById("trendChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: "line",
        data: {
            labels: Object.keys(monthCounts),
            datasets: [{
                label: "Complaints per Month",
                data: Object.values(monthCounts),
                borderColor: "#ff66b2",
                tension: 0.3
            }]
        }
    });
}
function logAction(message) {
    let logList = document.getElementById("adminLog");
    if (!logList) return;

    let li = document.createElement("li");
    li.innerText = message + " at " + new Date().toLocaleString();
    logList.appendChild(li);
}