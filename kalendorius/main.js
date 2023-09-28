function renderDay(dayIndex, day) {
        console.log('renering', day)
        return `<p id="day-content">${day.movie}` +
                `<zero-md src="kalendorius/days/${dayIndex}.md"></zero-md>` +
                `</p> `;
}
