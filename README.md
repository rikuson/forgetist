# Forgetist

Life hacking tool using [Todoist](https://todoist.com).

## Let's forget the past

Forgetist simply deletes overdue tasks from [Todoist](https://todoist.com).

I don't like seeing incomplete tasks which should have done few months ago.  
If you just leave it, those tasks are not important in your life.  
Then let's forget it and start brand new day!

## Installation

```
$ npm install -g forgetist
```

Add api token in your `.bash_profile`.  
You can check your api token [here](https://todoist.com/prefs/integrations).

```
export TODOIST_API_TOKEN=XXXXXXXXXXXXXXXX
```

## Usage

```
$ forgetist --help
forgetist [command]

Commands:
  forgetist list              List active tasks
  forgetist forget [hash...]  Delete overdue task
  forgetist remember          List deleted overdue tasks

Options:
  --help                      Show help
  --version                   Show version number
  --all, -a                   All of the overdue task
  --ctime                     Filter by created time
  --log                       Path to log directory
  --lang                      Specify language to parse date string
  --debug                     Debug mode
```

### List active tasks.

```
$ forgetist list
01b307acba4f54f55aafc33bb06bbbf6ca803e9a
DUE DATE: 2020-07-01
CREATED:  2020-07-01T17:34:55Z

first task

bd0888b5c8172bbe418736b952d5d50d277ce7aa
DUE DATE: 2020-07-02
CREATED:  2020-07-02T17:34:55Z

second task

$ forgetist list --ctime=-1
bd0888b5c8172bbe418736b952d5d50d277ce7aa
DUE DATE: 2020-07-02
CREATED:  2020-07-02T17:34:55Z

second task

```

### Delete overdue tasks.

```
$ forgetist forget 01b3
Delete 01b307acba4f54f55aafc33bb06bbbf6ca803e9a

$ forgetist forget --all
Delete 01b307acba4f54f55aafc33bb06bbbf6ca803e9a
Delete bd0888b5c8172bbe418736b952d5d50d277ce7aa

```

### List deleted overdue tasks.

```
$ forgetist remember
ID: 1234567890
DUE DATE: 2020-07-01
DELETED:  2020-07-03T17:34:55Z

first task

ID: 2345678901
DUE DATE: 2020-07-02
DELETED:  2020-07-03T17:34:55Z

second task

```

## Want pressure?

Set up cron job.

```
$ crontab -e
1 0 * * * forgetist forget --all
```
