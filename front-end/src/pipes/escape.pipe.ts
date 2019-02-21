import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'escape' })
export class EscapePipe implements PipeTransform {
  constructor() { }
  transform(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
