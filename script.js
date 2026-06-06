async function saveScript() {

    const code = document.getElementById("code").value;

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

    document.getElementById("result").innerHTML =
        location.origin + "/view.html?id=" + data.id;
}
