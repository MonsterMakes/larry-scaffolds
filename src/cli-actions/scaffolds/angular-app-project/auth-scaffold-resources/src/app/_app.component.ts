import { Component, OnInit, OnDestroy, enableProdMode } from '@angular/core';

import { AuthService } from "{{authProjectName}}";
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	title = 'web';
	constructor( private _authService: AuthService, private _currentRoute: ActivatedRoute) {
	}
	ngOnInit() {
		let routePath = window.location.pathname;
		let blacklisted = [
			'/login',
			'/logout',
			'/logged-out',
			'/auth'
		]
		let notBlacklisted = true;
		if(routePath !== '/auth/landing'){
			notBlacklisted = blacklisted.every((entry)=>{
				if(routePath === '' || routePath.startsWith(entry)){
					return false;
				}
				else{
					return true;
				}
			});
		}
		if(notBlacklisted){
			let jsonStr = JSON.stringify({
				redirectUri: routePath
			});
			let encodedStateParam = AuthService.base64UrlEncode(jsonStr);
			this._authService.login(encodedStateParam);
		}
	}
	ngOnDestroy() {
	}
}
