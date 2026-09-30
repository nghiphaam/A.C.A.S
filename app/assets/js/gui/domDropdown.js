export function doesDropdownItemExist(dropdownInputElem, itemValue) {
    const cleanedItemValue = CSS.escape(String(itemValue));

    if(cleanedItemValue === '') return false;

    const selector = `*[data-value=${cleanedItemValue}]`;

    return dropdownInputElem.parentElement.querySelector(selector) ? true : false;
}

export function addDropdownItem(dropdownElem, itemValue, itemText) {
    const listContainerElem = dropdownElem.querySelector('.dropdown-list-container');

    const itemElem = document.createElement('div');
        itemElem.classList.add('dropdown-item');
        itemElem.dataset.value = itemValue;
        itemElem.innerText = itemText ? itemText : itemValue;

    listContainerElem.appendChild(itemElem);

    return itemElem;
}

function getDropdownItems(listContainerElem) {
    return [...listContainerElem.querySelectorAll('.dropdown-item')]
        .filter(item => item?.dataset?.value);
}

function setSelectedItem(items, selectedItem) {
    const selectedClass = 'selected-list-item';

    items.forEach(item => item.classList.toggle(selectedClass, item === selectedItem));
}

function removeDropdownItem(dropdownElem, itemValue, newValue) {
    const dropdownItem = dropdownElem.querySelector(`*[data-value="${itemValue}"]`);
    const dropdownInput = dropdownElem.querySelector('input[data-default-value]');

    dropdownInput.value = newValue || dropdownInput.dataset.defaultValue;

    dropdownItem?.remove();

    dropdownInput.dispatchEvent(new Event('change'));
}

export function initializeDropdown(dropdownElem) {
    const inputElem = dropdownElem.querySelector('input');
    const iconElem = dropdownElem.querySelector('.dropdown-icon');
    const listContainerElem = dropdownElem.querySelector('.dropdown-list-container');

    function updateDropdown(showAll) {
        const listItems = getDropdownItems(listContainerElem);

        const optionsArr = listItems.map(elem => elem.dataset.value?.toLowerCase() || "");
        
        // Not pretty code and could be simpler
        const filterStr = inputElem.value.toLowerCase().trim();
        const words = filterStr.split(/\s+/);
        const filteredOptions = optionsArr.filter(option => 
            words.every(word => {
                const lowerCaseWord = word.toLowerCase();
                return option.includes(lowerCaseWord); 
            })
        );
            
        const options = showAll ? optionsArr : filteredOptions;
        const currentValue = inputElem.value?.toLowerCase()?.trim();

        listItems.forEach(elem => {
            const elemValue = elem.dataset.value?.toLowerCase();
            
            if(options.includes(elemValue) || options.includes(elem.dataset.value)) {
                elem.classList.remove('hidden');
            } else {
                elem.classList.add('hidden');
            }

            elem.classList.toggle('selected-list-item', Boolean(currentValue && elemValue === currentValue));
        });

        listItems
            .filter(elem => !elem.getAttribute('onclick-set'))
            .forEach(elem => {
                elem.addEventListener('click', e => {
                    inputElem.value = elem.dataset.value;

                    setSelectedItem(getDropdownItems(listContainerElem), elem);

                    setTimeout(() => {
                        inputElem.dispatchEvent(new Event('change'));

                        updateDropdown(true);
                    }, 100);
                });

                elem.setAttribute('onclick-set', true);
            });
    }

    inputElem.addEventListener('input', () => updateDropdown(false));
    iconElem.addEventListener('click', () => updateDropdown(true));

    updateDropdown(true);

    new MutationObserver(() => updateDropdown(true))
        .observe(listContainerElem, { childList: true, subtree: true });
}

export function initializeDropdowns() {
    const dropdownInputElems = [...document.querySelectorAll('.dropdown-input')];
    dropdownInputElems.forEach(elem => initializeDropdown(elem));
}
