function renderDay(dayIndex, day) {
        console.log('renering', day)
        // TODO: Add movie section.
        return `<p id="day-content">${true ? '' : day.movie}` +
                `<zero-md src="kalendorius/days/${dayIndex}.md">` +
                `<template><link rel="stylesheet" href="kalendorius/markdown-styles.css" /></template>` +
                `</zero-md>` +
                `</p> `;
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
