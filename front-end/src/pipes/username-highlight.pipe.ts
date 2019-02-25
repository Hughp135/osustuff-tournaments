import { Pipe, PipeTransform } from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'userHighlight' })
export class UsernameHighlightPipe implements PipeTransform {
  constructor(private _domSanitizer: DomSanitizer) {}
  transform(value: string, username: string): string {
    if (!username) {
      return value;
    }

    // Surround first occurence of username in message with highlight class
    let result = value;
    if (value.indexOf(username.toLowerCase()) !== -1) {
      // If username is spelled in lowercase
      result = value.replace(username.toLowerCase(), `<span class="user-highlight">${username}</span>`);
    } else {
      // If username is spelled correctly
      result = value.replace(username, `<span class="user-highlight">${username}</span>`);
    }

    return this._domSanitizer.sanitize(
      SecurityContext.HTML,
      this._domSanitizer.bypassSecurityTrustHtml(result),
    );
  }
}
