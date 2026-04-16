import { type IngredientCheck } from '@/context/GroceryContext';

export function downloadGroceryListPDF(alerts: IngredientCheck[]) {
  // Group alerts by recipe
  const alertsByRecipe: Record<string, IngredientCheck[]> = {};
  alerts.forEach(alert => {
    if (!alertsByRecipe[alert.recipeName]) {
      alertsByRecipe[alert.recipeName] = [];
    }
    alertsByRecipe[alert.recipeName].push(alert);
  });

  const alertsHTML = Object.entries(alertsByRecipe).map(([recipe, ingredients]) => `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px; border-bottom: 2px solid #10b981; padding-bottom: 4px;">
        For ${recipe}
      </h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${ingredients.map(ing => `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
            <div>
              <div style="font-weight: 500; color: #374151;">${ing.ingredientName}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                Needed: ${ing.requiredQty} ${ing.requiredUnit}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; 
                ${ing.status === 'missing' 
                  ? 'background-color: #fee2e2; color: #b91c1c;' 
                  : 'background-color: #fef3c7; color: #d97706;'}">
                ${ing.status === 'missing' ? 'Missing' : 'Low Stock'}
              </span>
              ${ing.availableQty > 0 ? `
              <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                Have: ${ing.availableQty} ${ing.availableUnit}
              </div>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Grocery Shopping List — NutriMom</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    @media print {
      body { padding: 0; margin: 0; max-width: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 28px; font-weight: 700; color: #064e3b; margin-bottom: 8px;">Shopping List</h1>
    <p style="color: #6b7280;">NutriMom • ${new Date().toLocaleDateString()}</p>
  </div>

  <div style="background: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
    ${Object.keys(alertsByRecipe).length === 0 
      ? '<div style="text-align: center; color: #6b7280; padding: 40px 0;">You have all ingredients for your planned meals!</div>'
      : alertsHTML
    }
  </div>

  <div class="no-print" style="margin-top: 32px; text-align: center;">
    <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
      Save as PDF / Print
    </button>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };
  }
}
