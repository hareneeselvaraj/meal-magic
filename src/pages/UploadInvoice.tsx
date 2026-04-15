import { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { geminiService } from '@/services/geminiOcrService';
import { processRawOCR } from '@/services/ocrEngine';

const UploadInvoice = () => {
  const [uploaded, setUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [detectedItems, setDetectedItems] = useState<{id: number, name: string, quantity: string}[]>([]);
  const [unmappedItems, setUnmappedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploaded(true);
    setIsProcessing(true);

    try {
      // 1. Extract pure text strings from the image using free Gemini OCR
      const rawTextItems = await geminiService.extractInvoiceItems(file);

      // 2. Process text through the matching engine
      const { matched, unmapped } = processRawOCR(rawTextItems);

      // 3. Map the matched items to UI format
      const formattedItems = matched.map((item, index) => ({
        id: index,
        name: item.name,
        quantity: `${item.quantity} ${item.unit}`
      }));

      setDetectedItems(formattedItems);
      setUnmappedItems(unmapped);
      
    } catch (error) {
      console.error("OCR Pipeline Failed:", error);
      alert("Failed to process invoice. Make sure you have the Gemini API key in your .env file.");
      setUploaded(false);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updateItem = (id: number, field: 'name' | 'quantity', value: string) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Upload Invoice</h1>

      <input 
        type="file" 
        accept="image/jpeg, image/png, application/pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!uploaded && !isProcessing ? (
        <GlassCard
          className="flex flex-col items-center justify-center py-16 cursor-pointer border-2 border-dashed border-foreground/10 hover:border-emerald-400/50 transition-colors"
          onClick={handleUploadClick}
        >
          <Upload size={40} className="text-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground/60">
            Tap to upload or drag & drop
          </p>
          <p className="text-xs text-foreground/30 mt-1">Supports JPG, PNG</p>
        </GlassCard>
      ) : isProcessing ? (
        <GlassCard className="flex flex-col items-center justify-center py-16">
          <Loader2 size={40} className="text-emerald-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-foreground">
            Gemini is reading your receipt...
          </p>
          <p className="text-xs text-foreground/40 mt-1">Extracting ingredients & quantities</p>
        </GlassCard>
      ) : (
        <>
          <GlassCard className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{fileName}</p>
              <p className="text-xs text-foreground/40">Uploaded just now</p>
            </div>
          </GlassCard>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Detected Items</h2>
            {detectedItems.length === 0 ? (
               <p className="text-sm text-foreground/60 italic">No exact matches found. Review unmapped items below.</p>
            ) : (
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
            )}
          </div>

          {unmappedItems.length > 0 && (
             <div className="mt-4">
               <h2 className="text-sm font-semibold text-foreground/60 mb-2">Unmapped Raw Items ({unmappedItems.length})</h2>
               <div className="space-y-1">
                 {unmappedItems.map((raw, idx) => (
                   <div key={idx} className="text-xs text-foreground/50 border-b border-foreground/5 pb-1">
                     &bull; {raw}
                   </div>
                 ))}
               </div>
             </div>
          )}

          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-6 text-base font-semibold mt-4"
            onClick={() => {
              // Note: Would typically persist this to groceryService db here
              setUploaded(false);
              setDetectedItems([]);
              setUnmappedItems([]);
              setFileName('');
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
