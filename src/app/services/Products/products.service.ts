import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = 'http://localhost:5181/api/products';  

  constructor(private http: HttpClient) { }

  getProducts(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);  
  }
}
