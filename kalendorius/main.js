function renderDay(dayIndex, day) {
    console.log('renering', day)
    // TODO: Add movie section.
    return `
    <div class="row" id="day-content">

        <div class="column-image">
            <img id="day-image" src="${day.image}" style="width:100%"/>
        </div>

        <div class="column-text">
            <p id="day-text-content">${true ? '' : day.movie}
                <zero-md src="kalendorius/days/${dayIndex}.md">
                    <template><link rel="stylesheet" href="kalendorius/markdown-styles.css?v=2" /></template>
                </zero-md>

                <a id="wreath-link" href="" target="_blank" style="align-self: center;">
                    <div class="wreath">
                        Šiandienos Kalėdinis filmas<br>
                        <div id="wreath-title">
                            Vienas namuose<br>
                        </div>
                    </div>
                </a>
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
