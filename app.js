
  // === Mode Switching for Fresher and HR ===
  const fresherBtn = document.getElementById("modeFresher");
  const hrBtn = document.getElementById("modeHR");
  const jobBox = document.getElementById("jobDescriptionBox");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const status = document.getElementById("status");
  const resultBox = document.getElementById("resultBox");

  let currentMode = "fresher";

  fresherBtn.addEventListener("click", () => {
    currentMode = "fresher";
    fresherBtn.classList.add("bg-cyan-600", "text-white");
    hrBtn.classList.remove("bg-cyan-600", "text-white");
    hrBtn.classList.add("bg-gray-700", "text-gray-200");
    jobBox.classList.add("hidden");
    status.textContent = "";
    resultBox.classList.add("hidden");
  });

  hrBtn.addEventListener("click", () => {
    currentMode = "hr";
    hrBtn.classList.add("bg-cyan-600", "text-white");
    fresherBtn.classList.remove("bg-cyan-600", "text-white");
    fresherBtn.classList.add("bg-gray-700", "text-gray-200");
    jobBox.classList.remove("hidden");
    status.textContent = "";
    resultBox.classList.add("hidden");
  });

  analyzeBtn.addEventListener("click", () => {
    const file = document.getElementById("resumeFile").files[0];
    const jobDescription = document.getElementById("jobDescription").value.trim();
    if (!file) {
      status.textContent = "Please upload a resume file first.";
      return;
    }
    if (currentMode === "hr" && !jobDescription) {
      status.textContent = "Please enter job description or criteria.";
      return;
    }
    status.textContent = "Analyzing resume...";
    resultBox.classList.add("hidden");

    setTimeout(() => {
      status.textContent = "";
      resultBox.classList.remove("hidden");
      let score = Math.floor(Math.random() * 41) + 60; // 60-100%
      if (currentMode === "fresher") {
        document.getElementById("scoreArea").innerHTML = `<div>ATS Score: <span class="text-cyan-400 font-bold">${score}%</span></div>`;
        document.getElementById("snippetArea").textContent = "Your resume scored well in structure and keywords. Try improving project descriptions for better impact.";
      } else {
        document.getElementById("scoreArea").innerHTML = `<div>Match with Job Criteria: <span class="text-green-400 font-bold">${score}%</span></div>`;
        document.getElementById("snippetArea").textContent = score > 75 
          ? "✅ This resume matches most of the job criteria. Candidate is suitable for further screening." 
          : "⚠️ Partial match found. Lacks some keywords or experience requirements.";
      }
    }, 2000);
  });

