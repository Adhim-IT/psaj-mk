'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema } from '@/lib/zod';
import type { EventFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, Calendar, Tag, FileText, Clock, CreditCard, MessageSquare, CheckCircle } from 'lucide-react';
import { createEvent, updateEvent } from '@/lib/list-event';
import Swal from 'sweetalert2';

interface Mentor {
  id: string;
  name: string;
  specialization?: string;
}

interface EventFormProps {
  initialData?: EventFormData;
  mentors: Mentor[];
  isEditing: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

function getValidImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.svg?height=160&width=240';

  // Jika URL sudah berupa data URL (base64), kembalikan apa adanya
  if (url.startsWith('data:')) return url;

  // Jika URL adalah URL Cloudinary yang valid
  if (url?.startsWith('http')) return url;

  // Jika bukan URL yang valid, kembalikan placeholder
  return '/placeholder.svg?height=160&width=240';
}

export function EventForm({ initialData, mentors, isEditing }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail || null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!initialData?.slug);
  const [thumbnailBase64, setThumbnailBase64] = useState<string | null>(null);

  // Get current date in YYYY-MM-DDThh:mm format for min attribute
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDate = today.toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      mentor_id: '',
      title: '',
      slug: '',
      thumbnail: '',
      description: '',
      start_date: new Date(),
      end_date: new Date(),
      price: '',
      whatsapp_group_link: '',
      is_active: true,
    },
  });

  const title = watch('title');

  useEffect(() => {
    if (autoGenerateSlug && title) {
      setValue('slug', slugify(title));
    }
  }, [title, autoGenerateSlug, setValue]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);

      try {
        // Convert file to base64
        const base64 = await convertToBase64(file);
        setThumbnailBase64(base64);
        // Tambahkan validasi URL sebelum menetapkan preview
        setThumbnailPreview(getValidImageUrl(base64));
        setValue('thumbnail', base64); // Store base64 in form data
      } catch (error) {
        console.error('Error converting file to base64:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to process the image. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      // If we have a base64 thumbnail, use it directly in the data
      if (thumbnailBase64) {
        data.thumbnail = thumbnailBase64;
      }

      const result = isEditing && initialData?.id ? await updateEvent(initialData.id, data) : await createEvent(data);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: isEditing ? 'Event Updated' : 'Event Created',
          text: isEditing ? 'Event has been updated successfully.' : 'New event has been created successfully.',
          confirmButtonText: 'OK',
        }).then(() => {
          router.push('/admin/dashboard/event/list');
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An unexpected error occurred',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mentor_id" className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Mentor
                </Label>
                <Select value={watch('mentor_id')} onValueChange={(value) => setValue('mentor_id', value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name} {mentor.specialization ? `- ${mentor.specialization}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mentor_id && <p className="mt-1 text-sm text-red-500">{errors.mentor_id.message}</p>}
              </div>

              <div>
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Title
                </Label>
                <Input id="title" {...register('title')} className="mt-1.5" placeholder="Enter event title" />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug" className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Slug
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-slug" checked={autoGenerateSlug} onCheckedChange={setAutoGenerateSlug} />
                    <Label htmlFor="auto-slug" className="text-xs text-muted-foreground">
                      Auto-generate
                    </Label>
                  </div>
                </div>
                <Input id="slug" {...register('slug')} className="mt-1.5" placeholder="Enter event slug" disabled={autoGenerateSlug} />
                {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
              </div>

              <div>
                <Label htmlFor="thumbnail" className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Thumbnail
                </Label>
                <div className="mt-1.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="mt-1 file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2.5 file:py-1 file:mr-2 hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>
                  {thumbnailPreview && (
                    <div className="mt-2 relative group">
                      <img
                        src={thumbnailPreview || '/placeholder.svg?height=160&width=240'}
                        alt="Thumbnail preview"
                        className="h-40 w-auto object-cover rounded-md border transition-all group-hover:opacity-90"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          e.currentTarget.src = '/placeholder.svg?height=160&width=240';
                          e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                      />
                    </div>
                  )}
                  {errors.thumbnail && <p className="mt-1 text-sm text-red-500">{errors.thumbnail.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Description
                </Label>
                <Textarea id="description" {...register('description')} className="mt-1.5" rows={4} placeholder="Enter event description" />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="start_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Start Date
                  </Label>
                  <Input id="start_date" type="datetime-local" className="mt-1.5" min={minDate} {...register('start_date')} />
                  {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date.message}</p>}
                </div>

                <div>
                  <Label htmlFor="end_date" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    End Date
                  </Label>
                  <Input id="end_date" type="datetime-local" className="mt-1.5" min={minDate} {...register('end_date')} />
                  {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="price" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Price (IDR)
                </Label>
                <Input id="price" type="number" min="0" step="1000" {...register('price')} className="mt-1.5" placeholder="Enter price (leave empty for free events)" />
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
              </div>

              <div>
                <Label htmlFor="whatsapp_group_link" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  WhatsApp Group Link
                </Label>
                <Input id="whatsapp_group_link" {...register('whatsapp_group_link')} className="mt-1.5" placeholder="Enter WhatsApp group link" />
                {errors.whatsapp_group_link && <p className="mt-1 text-sm text-red-500">{errors.whatsapp_group_link.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="is_active" checked={watch('is_active')} onCheckedChange={(checked) => setValue('is_active', checked)} />
                <Label htmlFor="is_active" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Active
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/dashboard/event/list')} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Event'
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
