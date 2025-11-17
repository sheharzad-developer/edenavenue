/**
 * Example usage of all UI components
 * This file demonstrates how to use each component
 */

'use client'

import { useState } from 'react'
import Button from './Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
import Input from './Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'
import { Form, FormGroup, FormLabel, FormError } from './Form'
import Badge from './Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './Dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from './Sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './DropdownMenu'

export function ComponentExamples() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="container mx-auto space-y-8 p-8">
      <h1 className="text-3xl font-bold">UI Components Examples</h1>

      {/* Button Examples */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>

      {/* Card Example */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Card</h2>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      </section>

      {/* Input Example */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Input</h2>
        <div className="w-full max-w-md space-y-4">
          <Input label="Email" type="email" placeholder="Enter your email" />
          <Input label="Password" type="password" placeholder="Enter password" />
          <Input label="With Error" error="This field is required" />
          <Input label="With Helper" helperText="This is helpful text" />
        </div>
      </section>

      {/* Table Example */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>
                <Badge variant="warning">Pending</Badge>
              </TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* Form Example */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Form</h2>
        <Form className="w-full max-w-md">
          <FormGroup>
            <FormLabel required>Name</FormLabel>
            <Input placeholder="Enter your name" />
          </FormGroup>
          <FormGroup>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Enter your email" />
            <FormError>Email is required</FormError>
          </FormGroup>
          <Button type="submit">Submit</Button>
        </Form>
      </section>

      {/* Badge Examples */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </section>

      {/* Dialog Example */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Dialog</h2>
        <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent onClose={() => setDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>This is a dialog description</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Dialog content goes here</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
            </DialogFooter>
            <DialogClose onClick={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </section>

      {/* Sheet Example */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Sheet (Mobile Sidebar)</h2>
        <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen} side="left">
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>This is a sheet description</SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <p>Sheet content goes here</p>
            </div>
            <SheetClose onClick={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </section>

      {/* Dropdown Menu Example */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Dropdown Menu</h2>
        <DropdownMenu
          trigger={
            <Button variant="outline">
              Menu
              <svg
                className="ml-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Button>
          }
        >
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => alert('Profile clicked')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => alert('Settings clicked')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => alert('Logout clicked')}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </div>
  )
}

