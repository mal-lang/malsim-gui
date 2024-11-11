import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-log-modal',
  templateUrl: './log-modal.component.html',
  styleUrl: './log-modal.component.scss',
})
export class LogModalComponent {
  @ViewChild('modalTrigger') modalTrigger: ElementRef;
  parsedLogs: Array<string> = [];

  title: string = '';

  open(node: any, logs: Array<any>) {
    this.title = 'Logs produced by ' + node.label;
    this.parseLogs(logs);
    this.modalTrigger.nativeElement.click();
  }

  parseLogs(logs: Array<any>) {
    let jsonLogs: Array<string> = [];
    logs.forEach((log) => {
      var str = JSON.stringify(log._source, null, 4); // spacing level = 2
      jsonLogs.push(str);
    });

    this.parsedLogs = jsonLogs;
  }
}
