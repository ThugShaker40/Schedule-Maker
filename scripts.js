 const scheduleBody = document.getElementById('schedule-body');
  const initialTimes = ['8:00 am','9:00 am','10:00 am','11:00 am','12:00 pm','1:00 pm','2:00 pm','3:00 pm','4:00 pm','5:00 pm','6:00 pm'];

  function createRow(label) {
    const row = document.createElement('tr');
    const timeCell = document.createElement('td');
    timeCell.contentEditable = true;
    timeCell.textContent = label;
    timeCell.classList.add('time-editable');

    const removeBtn = document.createElement('span');
    removeBtn.textContent = '❌';
    removeBtn.className = 'remove-row';
    removeBtn.onclick = () => row.remove();
    timeCell.appendChild(removeBtn);
    row.appendChild(timeCell);

    for (let i = 0; i < 7; i++) {
      const cell = document.createElement('td');
      const textArea = document.createElement('div');
      textArea.contentEditable = true;
      textArea.style.minHeight = '30px';
      cell.appendChild(textArea);
      cell.style.position = 'relative';

      const iconContainer = document.createElement('div');
      iconContainer.classList.add('icon-container');
      cell.appendChild(iconContainer);

      cell.ondragover = e => e.preventDefault();
      cell.ondrop = e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text');
        const dragged = document.getElementById(id);
        if (!dragged) return;
        if (dragged.classList.contains('draggable-icon')) {
          const icon = dragged.cloneNode(true);
          icon.classList.remove('draggable-icon');
          icon.removeAttribute('draggable');
          icon.classList.add('static-icon');
          icon.title = 'Click to remove';
          icon.onclick = () => icon.remove();
          iconContainer.appendChild(icon);
        } else if (dragged.classList.contains('color-swatch')) {
          cell.style.backgroundColor = dragged.style.backgroundColor;
        }
      };

      cell.addEventListener('contextmenu', e => {
        if (e.target === cell) {
          e.preventDefault();
          cell.style.backgroundColor = '';
        }
      });

      row.appendChild(cell);
    }
    scheduleBody.appendChild(row);
  }

  initialTimes.forEach(createRow);

  function addRow() {
    createRow('New');
  }

  function clearAll() {
    document.querySelectorAll('#schedule-table td').forEach(cell => {
      if (!cell.classList.contains('time-editable')) {
        const textArea = cell.querySelector('div[contenteditable]');
        const iconContainer = cell.querySelector('.icon-container');
        if (textArea) textArea.innerHTML = '';
        if (iconContainer) iconContainer.innerHTML = '';
        cell.style.backgroundColor = '';
      }
    });
      pastInputs.clear();
      localStorage.removeItem('schedulaHistory');
  }

  function clearColors() {
    document.querySelectorAll('#schedule-table td').forEach(cell => {
      cell.style.backgroundColor = '';
    });
  }

  document.querySelectorAll('.draggable-icon, .color-swatch').forEach(el => {
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text', e.target.id);
    });
  });

  function printSchedule() {
    document.querySelectorAll('.remove-row').forEach(btn => btn.style.display = 'none');
    window.print();
    setTimeout(() => {
      document.querySelectorAll('.remove-row').forEach(btn => btn.style.display = 'inline');
    }, 500);
  }

  async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    document.querySelectorAll('.remove-row').forEach(btn => btn.style.display = 'none');
    const container = document.getElementById('pdf-container');
    const canvas = await html2canvas(container, { scale: 2 });
    document.querySelectorAll('.remove-row').forEach(btn => btn.style.display = 'inline');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    pdf.save('schedule.pdf');
  }

  async function saveAsImage() {
    document.querySelectorAll('.remove-row').forEach(btn => btn.style.display = 'none');
    const container = document.getElementById('pdf-container');
    const canvas = await html2canvas(container, { scale: 2 });
    document.querySelectorAll('.remove-row').forEach(btn => btn.style.display = 'inline');
    const link = document.createElement('a');
    link.download = 'schedule.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function openColorPicker() {
  document.getElementById('colorPicker').click();
}

let customColorCount = 100;

function addCustomColor(color) {
  const swatch = document.createElement('div');
  swatch.className = 'color-swatch';
  swatch.style.backgroundColor = color;
  swatch.id = 'color' + customColorCount++;
  swatch.draggable = true;
  swatch.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text', swatch.id);
  });
  document.querySelector('.color-box').insertBefore(swatch, document.querySelector('.add-color'));
}

function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = event.currentTarget;
  dropdown.classList.toggle('open');
}

document.addEventListener('click', () => {
  document.querySelectorAll('.creator-dropdown.open').forEach(drop => drop.classList.remove('open'));
});
function showTutorial(type) {
  const isDesktop = type === 'desktop';

  document.getElementById('tutorial-desktop').style.display = isDesktop ? 'block' : 'none';
  document.getElementById('tutorial-phone').style.display = isDesktop ? 'none' : 'block';

  document.getElementById('tab-desktop').classList.toggle('active-tab', isDesktop);
  document.getElementById('tab-phone').classList.toggle('active-tab', !isDesktop);
}

let pastInputs = new Set(JSON.parse(localStorage.getItem('schedulaHistory') || '[]'));
const autocompleteBox = document.getElementById('autocomplete-box');
let currentTarget = null;
let activeIndex = -1;

// Watch all contenteditable divs for input
document.addEventListener('input', function (e) {
  const target = e.target;
  if (!target.isContentEditable) return;

  currentTarget = target;
  const text = target.textContent.trim();

  if (text.length >= 2) {
    const matches = [...pastInputs].filter(item =>
      item.toLowerCase().startsWith(text.toLowerCase())
    );
    showAutocomplete(matches, target);
  } else {
    autocompleteBox.style.display = 'none';
  }
});

// Blur: store value and hide box
document.addEventListener('blur', function (e) {
  const target = e.target;
  if (!target.isContentEditable) return;
  const text = target.textContent.trim();
  if (text) {
    const words = text.split(/\\s+/); // split by spaces // 
    words.forEach(word => {
    if (word.length > 1) pastInputs.add(word);
  });
  pastInputs.add(text); // also store the full phrase
  localStorage.setItem('schedulaHistory', JSON.stringify([...pastInputs]));
}
  setTimeout(() => autocompleteBox.style.display = 'none', 150);
}, true);

// Keyboard navigation (↑ ↓ Tab Enter Esc)
document.addEventListener('keydown', function (e) {
  if (!autocompleteBox || autocompleteBox.style.display === 'none') return;
  const items = autocompleteBox.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (activeIndex >= 0 && currentTarget && items[activeIndex]) {
      e.preventDefault();
      currentTarget.textContent = items[activeIndex].textContent;
      autocompleteBox.style.display = 'none';
      activeIndex = -1;
    }
  } else if (e.key === 'Escape') {
    autocompleteBox.style.display = 'none';
    activeIndex = -1;
  }
});

function updateActiveItem(items) {
  items.forEach((item, i) => {
    item.style.background = i === activeIndex ? '#ddd' : '';
  });
}

function showAutocomplete(matches, target) {
  currentTarget = target;
  activeIndex = -1;
  if (matches.length === 0) {
    autocompleteBox.style.display = 'none';
    return;
  }

  autocompleteBox.innerHTML = '';
  matches.forEach(match => {
    const li = document.createElement('li');
    li.textContent = match;
    li.onclick = () => {
      target.textContent = match;
      autocompleteBox.style.display = 'none';
    };
    autocompleteBox.appendChild(li);
  });

  const rect = target.getBoundingClientRect();
  autocompleteBox.style.left = `${rect.left + window.scrollX}px`;
  autocompleteBox.style.top = `${rect.bottom + window.scrollY}px`;
  autocompleteBox.style.display = 'block';
}
window.addEventListener('load', () => {
  const hasText = [...document.querySelectorAll('td div[contenteditable]')]
    .some(div => div.textContent.trim().length > 0);

  if (!hasText) {
    pastInputs.clear();
    localStorage.removeItem('schedulaHistory');
  }
});
