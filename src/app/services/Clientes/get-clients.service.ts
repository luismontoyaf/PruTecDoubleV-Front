import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = 'http://localhost:5181/api/clients'; 

  constructor(private http: HttpClient) { }

  getClients(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl); 
  }
}
