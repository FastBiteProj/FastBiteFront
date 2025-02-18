import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './TableCanvas.css';

export const TableCanvas = ({ 
  selectedTable, 
  onTableSelect, 
  isBlurred, 
  tables, 
  status 
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);

  const drawTables = (ctx) => {
    console.log('Drawing tables:', tables);
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Размеры и отступы
    const smallTableWidth = 60;
    const smallTableHeight = 60;
    const largeTableWidth = 100;
    const largeTableHeight = 60;
    const horizontalSpacing = 120;
    const verticalSpacing = 120;
    const startX = 300;
    const startY = 80;

    const drawTable = (x, y, width, height, tableId, isLarge) => {
      tablePositions[tableId] = { x, y, width, height };

      // Тень для стола
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Рисуем стол
      ctx.beginPath();
      ctx.fillStyle = '#FFE9C4';
      ctx.strokeStyle = '#DEB887';
      ctx.lineWidth = 2;
      ctx.roundRect(x, y, width, height, 5);
      ctx.fill();
      ctx.stroke();

      // Сбрасываем тень для остальных элементов
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Рисуем стулья
      const drawChair = (chairX, chairY) => {
        // Тень для стула
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.beginPath();
        ctx.fillStyle = '#A9A9A9';
        ctx.arc(chairX, chairY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Блик на стуле
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.arc(chairX - 2, chairY - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      };

      const chairOffset = 15;

      // Расставляем стулья
      if (isLarge) {
        drawChair(x + width * 0.25, y - chairOffset);
        drawChair(x + width * 0.75, y - chairOffset);
        drawChair(x + width + chairOffset, y + height * 0.5);
        drawChair(x + width * 0.75, y + height + chairOffset);
        drawChair(x + width * 0.25, y + height + chairOffset);
        drawChair(x - chairOffset, y + height * 0.5);
      } else {
        drawChair(x + width * 0.5, y - chairOffset);
        drawChair(x + width + chairOffset, y + height * 0.5);
        drawChair(x + width * 0.5, y + height + chairOffset);
        drawChair(x - chairOffset, y + height * 0.5);
      }

      // Выделение выбранного стола
      if (selectedTable === tableId) {
        ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
        ctx.roundRect(x, y, width, height, 5);
        ctx.fill();
      }

      // Если есть резервации
      const table = tables.find(t => t.tableNumber.toString() === tableId);
      if (table?.reservationsOnDate?.length > 0) {
        ctx.fillStyle = 'rgba(255, 99, 71, 0.15)';
        ctx.roundRect(x, y, width, height, 5);
        ctx.fill();
      }

      // Номер стола
      const text = `#${tableId}`;
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#4A4A4A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + width/2, y + height/2);
    };

    const tablePositions = {};

    // Отрисовка всех столов
    tables.forEach((table) => {
      const tableId = table.tableNumber.toString();
      const isLarge = table.tableCapacity > 4;
      const width = isLarge ? largeTableWidth : smallTableWidth;
      const height = isLarge ? largeTableHeight : smallTableHeight;
      const tableNum = parseInt(tableId);

      let x, y;
      if (tableNum <= 2) {
        // Верхний ряд
        x = startX + ((tableNum - 1) * horizontalSpacing);
        y = startY;
      } else if (tableNum <= 4) {
        // Средний ряд
        x = startX + ((tableNum - 3) * horizontalSpacing);
        y = startY + verticalSpacing;
      } else {
        // Нижний ряд (большие столы)
        x = startX - 40 + ((tableNum - 5) * horizontalSpacing);
        y = startY + (verticalSpacing * 2);
      }

      drawTable(x, y, width, height, tableId, isLarge);
    });

    canvasRef.current.tablePositions = tablePositions;
  };

  // Обновленная функция обработки кликов
  const handleCanvasClick = (e) => {
    if (isBlurred) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tablePositions = canvasRef.current.tablePositions;

    // Проверяем попадание клика в область стола
    for (const [tableId, position] of Object.entries(tablePositions)) {
      if (
        x >= position.x && 
        x <= position.x + position.width &&
        y >= position.y && 
        y <= position.y + position.height
      ) {
        onTableSelect(tableId);
        break;
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 450;
    
    if (Array.isArray(tables) && tables.length > 0) {
      drawTables(ctx);
    }
  }, [selectedTable, isBlurred, tables, status]);

  return (
    <div className="table-canvas-container">
      {status === 'loading' && (
        <div className="loading-overlay">{t('tableCanvas.loading')}</div>
      )}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`table-canvas ${isBlurred ? 'blurred' : ''}`}
      />
      <div className="table-tooltips">
        {Array.isArray(tables) && tables.map((table) => {
          const tableId = table.tableNumber.toString();
          
          return (
            <div
              key={tableId}
              className={`table-tooltip ${selectedTable === tableId ? 'visible' : ''}`}
            >
              <span className="table-tooltip-title">
                {t('tableCanvas.tooltips.title', {
                  tableId: tableId,
                  capacity: table.tableCapacity
                })}
              </span>
              <ul className="table-tooltip-times">
                {table.reservationsOnDate?.length > 0 ? (
                  table.reservationsOnDate.map((reservation, index) => (
                    <li key={index}>
                      {`${reservation.reservationStartTime} - ${reservation.reservationEndTime}`}
                    </li>
                  ))
                ) : (
                  <li>{t('tableCanvas.tooltips.noReservations')}</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

TableCanvas.propTypes = {
  selectedTable: PropTypes.string,
  onTableSelect: PropTypes.func.isRequired,
  isBlurred: PropTypes.bool.isRequired,
  tables: PropTypes.array.isRequired,
  status: PropTypes.string.isRequired,
}; 