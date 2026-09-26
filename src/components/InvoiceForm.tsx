import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { convertToIndonesianWords } from '@/utils/numberToWords';

// ---------- Schemas ----------
const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be non-negative'),
});

const invoiceSchema = z.object({
  pelanggan: z.string().min(1, 'Customer name is required'),
  tanggal: z.string().min(1, 'Date is required'),
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  periode: z.string().min(1, 'Rental period is required'),
  ongkir: z.number().min(0).optional(),
  alamatSewa: z.string().min(1, 'Rental address is required'),
  noItems: z.array(itemSchema).min(1, 'At least one item is required'),
  keterangan: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

// ---------- Component ----------
const InvoiceForm = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    mode: 'onBlur', // validate on blur for real-time feedback
    defaultValues: {
      tanggal: format(new Date(), 'yyyy-MM-dd'),
      noItems: [{ name: '', quantity: 1, price: 0 }],
      ongkir: 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'noItems',
  });

  const watchedItems = watch('noItems');
  const watchedOngkir = watch('ongkir') || 0;

  // ---------- Calculations ----------
  const subtotal = watchedItems?.reduce((acc, item) => {
    return acc + (item.quantity || 0) * (item.price || 0);
  }, 0) || 0;

  const total = subtotal + watchedOngkir;
  const totalTerbilang = convertToIndonesianWords(total);

  // ---------- Helpers ----------
  const handleAddItem = () => {
    append({ name: '', quantity: 1, price: 0 });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length <= 1) return;
    remove(index);
  };

  // ---------- Submit ----------
  const onSubmit = async (data: InvoiceFormData) => {
    setSubmissionError(null);
    setIsGenerating(true);

    try {
      const invoiceData = {
        pelanggan: data.pelanggan,
        tanggal: data.tanggal,
        invoiceNo: data.invoiceNo,
        periode: data.periode,
        alamatSewa: data.alamatSewa,
        noItems: data.noItems,
        ongkir: data.ongkir || 0,
        keterangan: data.keterangan || '',
      };

      const response = await fetch('http://localhost:3000/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.invoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success!',
        description: 'Invoice PDF has been generated and downloaded.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate invoice. Please check your backend connection.';
      setSubmissionError(message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pelanggan">Nama Costumer *</Label>
              <Input
                id="pelanggan"
                {...register('pelanggan')}
                placeholder="Masukan nama costumer"
              />
              {errors.pelanggan && (
                <p className="text-red-500 text-sm mt-1">{errors.pelanggan.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input
                id="tanggal"
                type="date"
                {...register('tanggal')}
              />
              {errors.tanggal && (
                <p className="text-red-500 text-sm mt-1">{errors.tanggal.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="invoiceNo">Nomor Invoice *</Label>
              <Input
                id="invoiceNo"
                {...register('invoiceNo')}
                placeholder="e.g., INV-001"
              />
              {errors.invoiceNo && (
                <p className="text-red-500 text-sm mt-1">{errors.invoiceNo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="periode">Periode Sewa *</Label>
              <Input
                id="periode"
                {...register('periode')}
                placeholder="e.g., 1 Bulan - 1 Minggu"
              />
              {errors.periode && (
                <p className="text-red-500 text-sm mt-1">{errors.periode.message}</p>
              )}
            </div>
          </div>

          {/* Alamat Sewa */}
          <div>
            <Label htmlFor="alamatSewa">Alamat Sewa *</Label>
            <Textarea
              id="alamatSewa"
              {...register('alamatSewa')}
              placeholder="Enter full rental address"
              rows={3}
            />
            {errors.alamatSewa && (
              <p className="text-red-500 text-sm mt-1">{errors.alamatSewa.message}</p>
            )}
          </div>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Nama Barang *</Label>
                    <Input
                      {...register(`noItems.${index}.name`)}
                      placeholder="Nama Barang"
                    />
                    {errors.noItems?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.noItems[index]?.name?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Jumlah *</Label>
                    <Input
                      type="number"
                      {...register(`noItems.${index}.quantity`, { valueAsNumber: true })}
                      min="1"
                    />
                    {errors.noItems?.[index]?.quantity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.noItems[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Harga (Rp) *</Label>
                    <Input
                      type="number"
                      {...register(`noItems.${index}.price`, { valueAsNumber: true })}
                      min="0"
                    />
                    {errors.noItems?.[index]?.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.noItems[index]?.price?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      disabled={fields.length <= 1}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Cost */}
          <div>
            <Label htmlFor="ongkir">Shipping Cost (Rp) - Optional</Label>
            <Input
              id="ongkir"
              type="number"
              {...register('ongkir', { valueAsNumber: true })}
              min="0"
              placeholder="0"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="keterangan">Additional Notes</Label>
            <Textarea
              id="keterangan"
              {...register('keterangan')}
              placeholder="Any additional notes or terms..."
              rows={3}
            />
          </div>

          {/* Total Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost:</span>
                  <span className="font-medium">Rp {watchedOngkir.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <strong>Terbilang:</strong> {totalTerbilang}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global submission error */}
          {submissionError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{submissionError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              className="w-full md:w-auto px-8 py-3 text-lg"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating PDF...' : 'Generate PDF Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;