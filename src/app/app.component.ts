import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit
{
    /**
     * Constructor
     */
    constructor(
        private authService: AuthService
    )
    {
    }

    ngOnInit() : void {
        this.authService.check().subscribe();
        // Ana sayfa yüklendiğinde konsola özel mesaj yazdır
        console.log('TÜM HAKKI SAKLIDIR - Ali Can Yücel');
    }
}
