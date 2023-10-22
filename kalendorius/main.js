function renderDay(dayIndex, day) {
        console.log('renering', day)
        // TODO: Add movie section.
        return `<p id="day-content">${true ? '' : day.movie}` +
                `<zero-md src="kalendorius/days/${dayIndex}.md">` +
                `<template><link rel="stylesheet" href="kalendorius/markdown-styles.css" /></template>` +
                `</zero-md>` +
                `</p> `;
}
