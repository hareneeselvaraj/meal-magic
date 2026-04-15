import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockOcrItems } from '@/data/mockData';

const UploadInvoice = () => {
  const [uploaded, setUploaded] = useState(false);
  const [detectedItems, setDetectedItems] = useState(
    mockOcrItems.map((item, i) => ({ ...item, id: i }))
  );

  const handleUpload = () => {
    setUploaded(true);
  };

  const updateItem = (id: number, field: 'name' | 'quantity', value: string) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Upload Invoice</h1>

      {!uploaded ? (
        <GlassCard
          className="flex flex-col items-center justify-center py-16 cursor-pointer border-2 border-dashed border-foreground/10 hover:border-emerald-400/50 transition-colors"
          onClick={handleUpload}
        >
          <Upload size={40} className="text-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground/60">
            Tap to upload or drag & drop
          </p>
          <p className="text-xs text-foreground/30 mt-1">Supports JPG, PNG, PDF</p>
        </GlassCard>
      ) : (
        <>
          <GlassCard className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">grocery_bill_apr14.jpg</p>
              <p className="text-xs text-foreground/40">Uploaded just now</p>
            </div>
          </GlassCard>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Detected Items</h2>
            <div className="space-y-2">
              {detectedItems.map((item) => (
                <GlassCard key={item.id} className="flex items-center gap-3">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm font-medium"
                  />
                  <Input
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    className="w-24 bg-transparent border-none text-sm text-right"
                  />
                </GlassCard>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-6 text-base font-semibold"
            onClick={() => {
              setUploaded(false);
              setDetectedItems(mockOcrItems.map((item, i) => ({ ...item, id: i })));
            }}
          >
            Update Inventory
          </Button>
        </>
      )}
    </div>
  );
};

export default UploadInvoice;
