import type { Recipe } from './types';

export function downloadRecipePDF(recipe: Recipe) {
  const ingredientsHTML = recipe.ingredients.map(ing => `
    <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
      <span style="font-weight: 500; color: #374151;">${ing.name} ${ing.nameInTamil ? `<span style="color: #6b7280; font-weight: normal; font-size: 13px;">(${ing.nameInTamil})</span>` : ''}</span>
      <span style="color: #6b7280; font-size: 14px;">${ing.quantity} ${ing.unit}</span>
    </li>
  `).join('');

  const instructionsHTML = recipe.instructions.map(inst => `
    <li style="margin-bottom: 16px; display: flex; gap: 12px; color: #374151; line-height: 1.5;">
      <span style="flex-shrink: 0; background: #10b981; color: white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px; font-weight: bold;">
        ${inst.stepNumber}
      </span>
      <div>
        <div style="font-weight: 500;">${inst.text}</div>
        ${inst.textInTamil ? `<div style="color: #6b7280; font-size: 13px; margin-top: 4px;">${inst.textInTamil}</div>` : ''}
        ${inst.durationMinutes ? `<div style="color: #10b981; font-size: 12px; font-weight: 600; margin-top: 4px;">⏳ ${inst.durationMinutes} mins</div>` : ''}
      </div>
    </li>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${recipe.name} — NutriMom</title>
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
    <h1 style="font-size: 28px; font-weight: 700; color: #064e3b; margin-bottom: 8px;">${recipe.name}</h1>
    <p style="color: #6b7280; font-size: 16px;">${recipe.nameInTamil}</p>
    
    <div style="display: flex; gap: 8px; justify-content: center; margin-top: 16px; flex-wrap: wrap;">
      <span style="background: #f3f4f6; color: #4b5563; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
        ⏱️ Prep: ${recipe.prepTimeMinutes}m • Cook: ${recipe.cookTimeMinutes}m
      </span>
      <span style="background: #f3f4f6; color: #4b5563; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
        🍽️ Servings: ${recipe.servings}
      </span>
    </div>
    
    ${recipe.healthTags && recipe.healthTags.length > 0 ? `
    <div style="display: flex; gap: 6px; justify-content: center; margin-top: 12px; flex-wrap: wrap;">
      ${recipe.healthTags.map(tag => `
        <span style="background: #d1fae5; color: #047857; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: capitalize;">
          ${tag.replace('_', ' ')}
        </span>
      `).join('')}
    </div>
    ` : ''}
  </div>

  <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
    <div style="background: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
      <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
        Ingredients
      </h3>
      <ul style="list-style: none;">
        ${ingredientsHTML}
      </ul>
    </div>

    <div style="background: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
      <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
        Instructions
      </h3>
      <ul style="list-style: none;">
        ${instructionsHTML}
      </ul>
    </div>
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
