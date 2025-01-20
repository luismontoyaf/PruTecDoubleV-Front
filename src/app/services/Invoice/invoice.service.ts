import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private apiUrl = 'http://localhost:5181/api/invoice';  
  
    constructor(private http: HttpClient) { }
  
    saveInvoice(invoiceRequest: any): Observable<any> {
      return this.http.post<any>(this.apiUrl+"/saveInvoice", invoiceRequest); 
    }

    searchInvoice(searchParams: { Client: string; NumeroFactura: string }): Observable<any[]> {
      return this.http.post<any[]>(`${this.apiUrl}/searchInvoice`, searchParams);
    }
}
