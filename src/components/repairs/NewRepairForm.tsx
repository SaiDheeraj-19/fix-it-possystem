"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { SecurityLockInputs } from '@/components/SecurityLockInputs';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle, Smartphone, Printer, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openInvoiceForPrint } from '@/lib/invoice';

interface RepairFormData {
    customerName: string;
    customerMobile: string;
    deviceBrand: string;
    deviceModel: string;
    imei: string;
    problem: string;
    estimatedCost: number;
    advance: number;
    warrantyDays: string;
}

const ImageUploadBox = ({ label, onUpload, id }: { label: string, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, id: string }) => (
    <div className="relative">
        <input
            type="file"
            id={id}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={onUpload}
        />
        <label
            htmlFor={id}
            className="border-2 border-dashed border-gray-600 hover:border-blue-400 bg-gray-800 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-all"
        >
            <Plus className="text-gray-400 w-8 h-8 mb-2" />
            <span className="text-xs font-medium text-gray-400">{label}</span>
        </label>
    </div>
);

export function NewRepairForm({ userId }: { userId: string }) {
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RepairFormData>({
        defaultValues: { warrantyDays: "" }
    });

    // Security State
    const [securityValue, setSecurityValue] = useState("");
    const [securityMode, setSecurityMode] = useState<"PATTERN" | "PIN" | "PASSWORD" | "NONE">("PATTERN");

    // Dynamic Images State
    const [images, setImages] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedData, setSavedData] = useState<any>(null);

    const est = watch('estimatedCost') || 0;
    const adv = watch('advance') || 0;
    const balance = est - adv;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Resize Image Logic (Client-Side Compression)
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 70% quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setImages(prev => [...prev, dataUrl]);

                    // Reset input
                    e.target.value = "";
                };
            };
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const onSubmit = async (data: RepairFormData) => {
        if (images.length === 0) {
            if (!confirm("No images attached. Are you sure you want to proceed without photos?")) {
                return;
            }
        }

        if (securityMode !== 'NONE' && !securityValue) {
            alert("Please capture PIN/Pattern or select 'No Lock'.");
            return;
        }

        try {
            const payload = {
                ...data,
                security: securityMode === 'NONE' ? null : { mode: securityMode, value: securityValue },
                images: images,
                userId
            };

            const res = await fetch('/api/repairs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to create repair');

            const result = await res.json();

            // Save invoice to database (optional, for record)
            await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repairId: result.repairId,
                    customerName: data.customerName,
                    customerMobile: data.customerMobile,
                    deviceBrand: data.deviceBrand,
                    deviceModel: data.deviceModel,
                    problem: data.problem,
                    estimatedCost: data.estimatedCost,
                    advance: data.advance,
                    warrantyDays: data.warrantyDays
                })
            });

            setSavedData({ ...data, repairId: result.repairId });
            setShowSuccess(true);
        } catch (e) {
            console.error(e);
            alert("Error creating repair order. Please try again.");
        }
    };

    const handlePrintInvoice = () => {
        if (savedData) {
            openInvoiceForPrint({
                customerName: savedData.customerName,
                customerMobile: savedData.customerMobile,
                deviceBrand: savedData.deviceBrand,
                deviceModel: savedData.deviceModel,
                problem: savedData.problem,
                estimatedCost: savedData.estimatedCost,
                advance: savedData.advance,
                invoiceNumber: savedData.repairId?.slice(0, 8) || 'DRAFT',
                warrantyDays: savedData.warrantyDays
            });
        }
    };

    if (showSuccess) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Repair Created Successfully!</h2>
                <p className="text-gray-400 mb-6">Order ID: {savedData?.repairId?.slice(0, 8)}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={handlePrintInvoice} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold">
                        <Printer className="w-5 h-5" /> Print Invoice
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Customer & Device */}
            <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-3">1</span>
                    Customer & Device
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Customer Name *</label>
                        <input {...register('customerName', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Customer Name" />
                        {errors.customerName && <span className="text-red-400 text-xs">Required</span>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Mobile Number *</label>
                        <input {...register('customerMobile', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Device Brand</label>
                        <select {...register('deviceBrand', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-blue-500">
                            <option value="">Select Brand</option>
                            <option value="Apple">Apple</option>
                            <option value="Samsung">Samsung</option>
                            <option value="Xiaomi">Xiaomi / Redmi</option>
                            <option value="OnePlus">OnePlus</option>
                            <option value="Vivo">Vivo</option>
                            <option value="Oppo">Oppo</option>
                            <option value="Realme">Realme</option>
                            <option value="Motorola">Motorola</option>
                            <option value="Nokia">Nokia</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Model</label>
                        <input {...register('deviceModel', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="e.g. Galaxy M31, iPhone 13" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">Problem Description</label>
                        <textarea {...register('problem', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white h-24 focus:border-blue-500 outline-none" placeholder="Describe the issue in detail..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">IMEI (Last 4 digits)</label>
                        <input {...register('imei')} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white" placeholder="Optional" maxLength={4} />
                    </div>
                </div>
            </section>

            {/* Step 2: Financials & Warranty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-3">2</span>
                        Pricing & Warranty
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Estimated Cost (Rs.)</label>
                            <input type="number" {...register('estimatedCost', { valueAsNumber: true })} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-lg font-bold text-right focus:border-blue-500 outline-none" placeholder="0" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Advance Paid (Rs.)</label>
                            <input type="number" {...register('advance', { valueAsNumber: true })} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-green-400 text-lg font-bold text-right focus:border-blue-500 outline-none" placeholder="0" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Warranty</label>
                            <input type="text" {...register('warrantyDays')} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="e.g. 30 Days, 3 Months, or None" />
                            <p className="text-xs text-gray-500 mt-1">Enter warranty period</p>
                        </div>
                        <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Balance Due</span>
                            <span className="text-2xl font-bold text-red-400">Rs. {balance.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-3">3</span>
                        Device Photos
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                        {/* Render Existing Images */}
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-700 group">
                                <img src={img} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {/* Upload Button */}
                        <ImageUploadBox
                            id="photo-upload-dynamic"
                            label="Add Photo"
                            onUpload={handleImageUpload}
                        />
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        {images.length === 0 ? "No photos added" : `${images.length} photo(s) added`}
                    </p>
                </section>
            </div>

            {/* Step 3: Security Lock */}
            <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-3">4</span>
                        Security Pattern / PIN
                    </h3>
                </div>

                <SecurityLockInputs
                    initialMode="PATTERN"
                    onChange={(val, mode) => {
                        setSecurityValue(val);
                        setSecurityMode(mode);
                    }}
                />
            </section>

            {/* Submit */}
            <div className="pt-4 pb-12">
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Smartphone className="mr-2" />}
                    CREATE REPAIR ORDER
                </Button>
            </div>
        </form>
    );
}
