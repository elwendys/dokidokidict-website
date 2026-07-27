(() => {
    const input = document.querySelector("[data-work-search-input]");
    const items = [...document.querySelectorAll("[data-work-search-item]")];
    const empty = document.querySelector("[data-work-search-empty]");

    if (!input || !items.length) return;

    const normalize = value => value.toLocaleLowerCase().normalize("NFKC");

    input.addEventListener("input", () => {
        const query = normalize(input.value.trim());
        let visible = 0;

        items.forEach(item => {
            const matches = !query || normalize(item.dataset.search || item.textContent).includes(query);
            item.hidden = !matches;
            if (matches) visible += 1;
        });

        if (empty) empty.style.display = visible ? "none" : "block";
    });
})();
