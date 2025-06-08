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
