function renderDay(dayIndex, day) {
    console.log('renering', day)
    return `
    <div class="row" id="day-content">

        <div class="column-image">
            <img id="day-image" src="${day.image}" style="width:100%;"/>
        </div>

        <div class="column-text">
            <p id="day-text-content">${true ? '' : day.movie}
                <zero-md src="kalendorius/days/${dayIndex}.md">
                    <template><link rel="stylesheet" href="kalendorius/markdown-styles.css?v=2" /></template>
                    <template data-append>
                        <style>
                            @media (min-aspect-ratio: 3/4) or (max-height: 835px) {
                                .mobile-image {
                                    visibility: hidden;
                                    height: 0px;
                                    widht: 0px;
                                }
                            }
                        </style>
                    </template>
                </zero-md>

<div class="card-wrapper" style="
    display:inline-block;
    perspective:1000px;
    position:relative;
    width:100%;
    z-index:1000;
">
    <style>
        .card-wrapper:hover .card-inner {
            transform: rotateY(180deg);
        }
    </style>

    <div class="card-inner" style="
        margin:auto;
        position:relative;
        aspect-ratio:658/507;
        transform-style:preserve-3d;
        transition:transform 0.6s;
    ">

        <!-- back side -->
        <img src="../../kalendorius/card-back.png" style="
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            object-fit:cover;
            backface-visibility:hidden;
            border-radius:8px;
        ">

        <!-- front side -->
        <img src="../../kalendorius/card-day${dayIndex}.png" style="
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            object-fit:cover;
            transform:rotateY(180deg);
            backface-visibility:hidden;
            border-radius:8px;
        ">
    </div>
    <a href="zurnalas.html" target="_blank" style="
        display:block;
        margin:40px 0 0;
        margin-left: auto;
        margin-right: auto;
        padding:18px 22px;
        border:1px solid #e0e0e0;
        border-radius:8px;
        text-decoration:underline;
        font-size:18px;
        line-height:1.4;
        color:#000;
        background:#fafafa;
        transition:background 0.2s, border-color 0.2s;
        font-family: Mulish;
        font-size: 18px;
        width: 80%;
   ">
        Patiko kalendorius?<br> Paremkite mus ir atraskite dar daugiau receptų naujame žurnalo „Valgyk&nbsp;Daugiau&nbsp;Daržovių“ numeryje! 👈
    </a>
</div>

            </p> 
        </div>
        <div class="down-arrow"></div>
    </div>`
        ;
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function ping(scope) {

    var ref = localStorage.getItem("ref")
    if (!ref) {
        ref = uuidv4()
        localStorage.setItem("ref", ref)
    }

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            author: '',
            reference: 'amlt-' + ref,
            content: scope
        })
    };
    fetch('https://vegancity.laz.dev/feedback', requestOptions)
}
