'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteEvent } from '@/lib/list-event';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface Event {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  description: string;
  whatsapp_group_link: string;
  price: number;
  start_date: Date | string;
  end_date: Date | string;
  is_active: boolean;
  mentors: {
    name: string;
  };
}

interface EventListProps {
  events: Event[];
  onDelete?: (id: string) => Promise<boolean>;
}

export function EventList({ events, onDelete }: EventListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [localEvents, setLocalEvents] = useState(events); // State lokal untuk update UI
  const router = useRouter();

  const filteredEvents = localEvents.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const openDeleteDialog = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      const success = await deleteEvent(eventToDelete);
      if (success) {
        setLocalEvents(localEvents.filter((event) => event.id !== eventToDelete));
        Swal.fire({
          title: 'Deleted!',
          text: 'Event has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete event.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      console.error('Error deleting event:', error);
    } finally {
      setEventToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search events..." className="pl-8 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/event/list/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Event
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No events found. Create your first event.
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    {event.thumbnail ? (
                      <img
                        src={event.thumbnail || '/placeholder.svg'}
                        alt={event.title}
                        className="h-14 w-20 object-cover rounded-md"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          e.currentTarget.src = '/placeholder.svg?height=56&width=80';
                          e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                      />
                    ) : (
                      <div className="h-14 w-20 bg-muted flex items-center justify-center rounded-md">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.mentors?.name}</TableCell>
                  <TableCell>
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(event.price)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        event.is_active ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
                      }`}
                    >
                      {event.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/event/list/edit/${event.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(event.id)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the event and remove the data from our servers.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
