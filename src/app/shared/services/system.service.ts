import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SystemService {

    private baseUrl = `${environment.apiUrl}/System`;
    constructor(private http: HttpClient) { }

    // for downloading attachment from any source
    downloadAttachment(source: string, id: number): Observable<Blob> {
        return this.http.get(
            `${this.baseUrl}/download-attachment`,
            {
                params: {
                    source: source,
                    id: id.toString()
                },
                responseType: 'blob'
            }
        );
    }
}