import { type Options, mande } from 'mande'

export const contacts = mande('http://localhost:7777/contacts', {})

export interface _UpdateInfo {
  createdAt: string
  updatedAt: string
}

interface ContactInfo {
  id: number
  firstName: string
  lastName: string
  bio: string
  photoURL: string
  isFavorite: boolean
}

export interface Contact extends ContactInfo, _UpdateInfo {}

/**
 * Retrieve all the contact list.
 */
export async function getAllContacts(options?: Options<'json'>) {
  // await new Promise(resolve => setTimeout(resolve, 2000))
  return contacts.get<Contact[]>('/', options)
}

/**
 * Get the information of a contact by using its id.
 *
 * @param id id of the contact
 */
export async function getContactById(
  id: string | number,
  options?: Options<'json'>,
) {
  if (Math.random() > 0.75) {
    throw new Error('Failed to fetch')
  }
  return contacts.get<Contact>(id, options)
}

/**
 * Create a new contact.
 *
 * @param contact - The contact to create
 * @param options - Optional request options
 * @returns the created contact
 */
export function createContact(
  contact: Omit<ContactInfo, 'id' | 'updatedAt' | 'createdAt'>,
  options?: Options<'json'>,
) {
  return contacts.post<Contact>(
    '/',
    contact,
    options,
  )
}

/**
 * Update a contact.
 *
 * @param contact - The contact to update
 * @returns the updated contact
 */
export function updateContact(
  contact: Partial<ContactInfo> & { id: number },
  options?: Options<'json'>,
): Promise<Contact> {
  return contacts.patch<Contact, 'json'>(`/${contact.id}`, contact, options)
}

/**
 * Update a contact.
 *
 * @param contact - The contact to update
 * @returns the updated contact
 */
export function patchContact(
  contact: Partial<ContactInfo> & { id: number },
): Promise<Contact> {
  return contacts.patch<Contact, 'json'>(`/${contact.id}`, contact)
}

/**
 * Search the contacts database.
 *
 * @param searchText - the text to search for
 * @param payload - search, page, number per page, and other filtering options
 * @param payload.page - the page number to retrieve
 * @param payload.perPage - the number of items to retrieve per page
 * @param payload.filterInfo - any other filtering options
 * @param options - Optional request options
 * @returns an object with the total of results and an array with at most `perPage` (defaults to 10) elements in it
 */
export function searchContacts(
  searchText: string,
  {
    page,
    perPage,
    ...filterInfo
  }: {
    page?: number
    perPage?: number | string
  } & Partial<Contact> = {},
  options?: Options<'response'>,
): Promise<{ total: number, results: Contact[] }> {
  const query: Record<string, string | null | undefined | number | boolean>
    = filterInfo as Record<string, string | boolean | number | null>
  if (searchText) query.q = searchText
  if (page) query._page = page
  if (perPage) query._limit = perPage

  return contacts
    .get('/', { query, responseAs: 'response', ...options })
    .then(async (res) => ({
      total: Number(res.headers.get('x-total-count')) || 0,
      results: (await res.json()) as Contact[],
    }))
}

/**
 * Delete a contact by its id.
 *
 * @param id - The id of the contact to delete
 * @param options - Optional request options
 * @returns A promise that resolves when the contact is deleted
 */
export async function deleteContactById(
  id: string | number,
  options?: Options<'json'>,
): Promise<void> {
  return contacts.delete(`/${id}`, options)
}
