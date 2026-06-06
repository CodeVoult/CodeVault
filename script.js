async function saveScript(){

    const code =
    document.getElementById("code").value;

    if(!code.trim()){
        alert("Write a script first.");
        return;
    }

    const response = await fetch(
        "https://codevault-gvyn.onrender.com/save",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                code:code
            })
        }
    );

    const data = await response.json();

    const url =
    location.origin +
    "/view.html?id=" +
    data.id;

    const result =
    document.getElementById("result");

    result.style.display = "block";

    result.innerHTML = `
        <b>Script Saved</b>
        <br><br>
        <span class="link">${url}</span>
    `;
}

function copyCode(){

    navigator.clipboard.writeText(
        document.getElementById("code").value
    );

    alert("Copied");
}
