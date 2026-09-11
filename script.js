/**
 * Ужарка - Калькулятор потерь веса
 * Модульная архитектура с поддержкой замены хранилища данных
 */

// ============================================
// DATA STORAGE MODULE (Подготовка к БД)
// ============================================
const StorageModule = {
    // Текущая реализация через localStorage
    // Может быть заменена на API вызовы (Supabase, Firebase и т.д.)
    
    storageKey: 'uzharka_journal',
    
    // Получить все записи
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from storage:', error);
            return [];
        }
    },
    
    // Добавить запись
    add(entry) {
        try {
            const entries = this.getAll();
            entries.unshift({ ...entry, id: Date.now() });
            localStorage.setItem(this.storageKey, JSON.stringify(entries));
            return true;
        } catch (error) {
            console.error('Error adding to storage:', error);
            return false;
        }
    },
    
    // Очистить все записи
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },
    
    // Получить количество записей
    getCount() {
        return this.getAll().length;
    }
};

// ============================================
// CALCULATOR MODULE
// ============================================
const CalculatorModule = {
    modes: {
        shrinkage: 'Ужарка',
        expansion: 'Уварка',
        target: 'Целевой вес'
    },
    
    currentMode: 'shrinkage',
    lastResult: null,
    
    calculate(inputWeight, outputWeight, targetLoss = 0) {
        if (this.currentMode === 'target') {
            // Режим целевого веса
            const loss = inputWeight * (targetLoss / 100);
            const finalWeight = inputWeight - loss;
            return {
                loss: loss,
                lossPercent: targetLoss,
                finalWeight: finalWeight,
                inputWeight,
                outputWeight: finalWeight
            };
        } else {
            // Стандартный расчет
            const loss = inputWeight - outputWeight;
            const lossPercent = (loss / inputWeight) * 100;
            return {
                loss: loss,
                lossPercent: lossPercent,
                finalWeight: outputWeight,
                inputWeight,
                outputWeight
            };
        }
    },
    
    setMode(mode) {
        this.currentMode = mode;
    },
    
    getModeName() {
        return this.modes[this.currentMode];
    }
};

// ============================================
// EXPORT MODULE
// ============================================
const ExportModule = {
    // Экспорт в JSON
    exportJson(data) {
        if (!data || data.length === 0) {
            alert('Журнал пуст для экспорта');
            return false;
        }
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `uzharka_export_${this.getDateStamp()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    },
    
    // Экспорт в Excel
    exportExcel(data) {
        if (!data || data.length === 0) {
            alert('Журнал пуст для экспорта');
            return false;
        }
        
        try {
            const worksheetData = [
                ['Дата', 'Режим', 'Вход (г)', 'Выход (г)', 'Потеря (г)', 'Потеря (%)']
            ];
            
            data.forEach(entry => {
                worksheetData.push([
                    entry.date,
                    entry.mode,
                    entry.inputWeight,
                    entry.outputWeight,
                    entry.loss,
                    entry.lossPercent.toFixed(2)
                ]);
            });
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(wb, ws, 'Журнал');
            XLSX.writeFile(wb, `uzharka_export_${this.getDateStamp()}.xlsx`);
            
            return true;
        } catch (error) {
            console.error('Excel export error:', error);
            alert('Ошибка экспорта в Excel');
            return false;
        }
    },
    
    // Экспорт в PDF
    async exportPdf(data) {
        if (!data || data.length === 0) {
            alert('Журнал пуст для экспорта');
            return false;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Заголовок
            doc.setFontSize(20);
            doc.text('Ужарка - Журнал записей', 105, 20, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Дата экспорта: ${new Date().toLocaleString('ru-RU')}`, 105, 30, { align: 'center' });
            
            // Таблица
            const headers = [['Дата', 'Режим', 'Вход (г)', 'Выход (г)', 'Потеря (г)', 'Потеря (%)']];
            const rows = data.map(entry => [
                entry.date,
                entry.mode,
                entry.inputWeight.toString(),
                entry.outputWeight.toString(),
                entry.loss.toString(),
                entry.lossPercent.toFixed(2) + '%'
            ]);
            
            doc.autoTable({
                head: headers,
                body: rows,
                startY: 40,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [255, 107, 53] }
            });
            
            doc.save(`uzharka_export_${this.getDateStamp()}.pdf`);
            return true;
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Ошибка экспорта в PDF. Попробуйте использовать функцию печати.');
            return false;
        }
    },
    
    // Печать
    printJournal(data) {
        if (!data || data.length === 0) {
            alert('Журнал пуст для печати');
            return false;
        }
        
        const printContainer = document.getElementById('printContainer');
        
        let tableRows = '';
        data.forEach(entry => {
            tableRows += `
                <tr>
                    <td>${entry.date}</td>
                    <td>${entry.mode}</td>
                    <td>${entry.inputWeight}</td>
                    <td>${entry.outputWeight}</td>
                    <td>${entry.loss}</td>
                    <td>${entry.lossPercent.toFixed(2)}%</td>
                </tr>
            `;
        });
        
        printContainer.innerHTML = `
            <div class="print-header">
                <h1>🔥 Ужарка - Журнал записей</h1>
                <p>Калькулятор потерь веса</p>
            </div>
            <div class="print-date">Дата печати: ${new Date().toLocaleString('ru-RU')}</div>
            <table>
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Режим</th>
                        <th>Вход (г)</th>
                        <th>Выход (г)</th>
                        <th>Потеря (г)</th>
                        <th>Потеря (%)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
        
        window.print();
        
        // Очистка после печати
        setTimeout(() => {
            printContainer.innerHTML = '';
        }, 1000);
        
        return true;
    },
    
    getDateStamp() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
};

// ============================================
// UI MODULE
// ============================================
const UIModule = {
    elements: {},
    
    init() {
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            themeIcon: document.querySelector('.theme-icon'),
            calculatorForm: document.getElementById('calculatorForm'),
            inputWeight: document.getElementById('inputWeight'),
            outputWeight: document.getElementById('outputWeight'),
            targetLoss: document.getElementById('targetLoss'),
            result: document.getElementById('result'),
            lossValue: document.getElementById('lossValue'),
            lossPercent: document.getElementById('lossPercent'),
            finalWeight: document.getElementById('finalWeight'),
            saveToJournal: document.getElementById('saveToJournal'),
            journalBody: document.getElementById('journalBody'),
            emptyJournal: document.getElementById('emptyJournal'),
            exportJson: document.getElementById('exportJson'),
            exportExcel: document.getElementById('exportExcel'),
            exportPdf: document.getElementById('exportPdf'),
            printJournal: document.getElementById('printJournal'),
            clearJournal: document.getElementById('clearJournal'),
            modeBtns: document.querySelectorAll('.mode-btn'),
            targetWeightGroup: document.querySelector('.target-weight-group'),
            targetResult: document.querySelector('.target-result')
        };
    },
    
    setTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        this.elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('uzharka_theme', isDark ? 'dark' : 'light');
    },
    
    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.setTheme(!isDark);
    },
    
    loadTheme() {
        const savedTheme = localStorage.getItem('uzharka_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));
    },
    
    updateModeButtons(activeMode) {
        this.elements.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === activeMode);
        });
    },
    
    showTargetWeightField(show) {
        if (show) {
            this.elements.targetWeightGroup.classList.remove('hidden');
            this.elements.targetLoss.required = true;
            this.elements.outputWeight.required = false;
        } else {
            this.elements.targetWeightGroup.classList.add('hidden');
            this.elements.targetLoss.required = false;
            this.elements.outputWeight.required = true;
        }
    },
    
    displayResult(result) {
        this.elements.lossValue.textContent = `${result.loss.toFixed(2)} г`;
        this.elements.lossPercent.textContent = `${result.lossPercent.toFixed(2)}%`;
        
        if (CalculatorModule.currentMode === 'target') {
            this.elements.finalWeight.textContent = `${result.finalWeight.toFixed(2)} г`;
            this.elements.targetResult.classList.remove('hidden');
        } else {
            this.elements.targetResult.classList.add('hidden');
        }
        
        this.elements.result.classList.remove('hidden');
    },
    
    renderJournal(entries) {
        if (entries.length === 0) {
            this.elements.journalBody.innerHTML = '';
            this.elements.emptyJournal.classList.remove('hidden');
            return;
        }
        
        this.elements.emptyJournal.classList.add('hidden');
        
        this.elements.journalBody.innerHTML = entries.map(entry => `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.mode}</td>
                <td>${entry.inputWeight}</td>
                <td>${entry.outputWeight}</td>
                <td>${entry.loss.toFixed(2)}</td>
                <td>${entry.lossPercent.toFixed(2)}%</td>
            </tr>
        `).join('');
    },
    
    resetForm() {
        this.elements.calculatorForm.reset();
        this.elements.result.classList.add('hidden');
    },
    
    showError(message) {
        alert(message);
    }
};

// ============================================
// APP CONTROLLER
// ============================================
const AppController = {
    init() {
        UIModule.init();
        UIModule.loadTheme();
        this.bindEvents();
        this.loadJournal();
    },
    
    bindEvents() {
        // Переключение темы
        UIModule.elements.themeToggle.addEventListener('click', () => {
            UIModule.toggleTheme();
        });
        
        // Переключение режимов
        UIModule.elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                CalculatorModule.setMode(mode);
                UIModule.updateModeButtons(mode);
                UIModule.showTargetWeightField(mode === 'target');
                UIModule.resetForm();
            });
        });
        
        // Расчет
        UIModule.elements.calculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });
        
        // Сохранение в журнал
        UIModule.elements.saveToJournal.addEventListener('click', () => {
            this.saveToJournal();
        });
        
        // Экспорт JSON
        UIModule.elements.exportJson.addEventListener('click', () => {
            const data = StorageModule.getAll();
            ExportModule.exportJson(data);
        });
        
        // Экспорт Excel
        UIModule.elements.exportExcel.addEventListener('click', () => {
            const data = StorageModule.getAll();
            ExportModule.exportExcel(data);
        });
        
        // Экспорт PDF
        UIModule.elements.exportPdf.addEventListener('click', () => {
            const data = StorageModule.getAll();
            ExportModule.exportPdf(data);
        });
        
        // Печать
        UIModule.elements.printJournal.addEventListener('click', () => {
            const data = StorageModule.getAll();
            ExportModule.printJournal(data);
        });
        
        // Очистка журнала
        UIModule.elements.clearJournal.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить весь журнал?')) {
                StorageModule.clear();
                this.loadJournal();
            }
        });
    },
    
    calculate() {
        const inputWeight = parseFloat(UIModule.elements.inputWeight.value);
        const outputWeight = parseFloat(UIModule.elements.outputWeight.value);
        const targetLoss = parseFloat(UIModule.elements.targetLoss.value) || 0;
        
        if (isNaN(inputWeight) || inputWeight <= 0) {
            UIModule.showError('Введите корректный входной вес');
            return;
        }
        
        if (CalculatorModule.currentMode !== 'target' && (isNaN(outputWeight) || outputWeight < 0)) {
            UIModule.showError('Введите корректный выходной вес');
            return;
        }
        
        if (CalculatorModule.currentMode === 'target' && (isNaN(targetLoss) || targetLoss < 0 || targetLoss > 100)) {
            UIModule.showError('Введите корректную целевую потерю (0-100%)');
            return;
        }
        
        const result = CalculatorModule.calculate(inputWeight, outputWeight, targetLoss);
        CalculatorModule.lastResult = result;
        UIModule.displayResult(result);
    },
    
    saveToJournal() {
        if (!CalculatorModule.lastResult) {
            UIModule.showError('Сначала выполните расчет');
            return;
        }
        
        const result = CalculatorModule.lastResult;
        const entry = {
            date: new Date().toLocaleString('ru-RU'),
            mode: CalculatorModule.getModeName(),
            inputWeight: result.inputWeight,
            outputWeight: result.outputWeight,
            loss: result.loss,
            lossPercent: result.lossPercent
        };
        
        if (StorageModule.add(entry)) {
            this.loadJournal();
            UIModule.resetForm();
        } else {
            UIModule.showError('Ошибка сохранения в журнал');
        }
    },
    
    loadJournal() {
        const entries = StorageModule.getAll();
        UIModule.renderJournal(entries);
    }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});
