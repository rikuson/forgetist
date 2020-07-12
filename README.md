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
  forgetist list              List overdue tasks
  forgetist forget [hash...]  Delete overdue task
  forgetist remember          List deleted overdue tasks

Options:
  --help                      Show help
  --version                   Show version number
  --all, -a                   All of the overdue task
  --ctime                     Filter by created time
  --log                       Path to log directory
  --debug                     Debug mode
```

### List overdue tasks.

```
$ forgetist list
01b307acba4f54f55aafc33bb06bbbf6ca803e9a
DUE DATE: 7/1/2020
CREATED:  7/1/2020 5:34:55 PM

first task

bd0888b5c8172bbe418736b952d5d50d277ce7aa
DUE DATE: 7/2/2020
CREATED:  7/2/2020 4:31:43 PM

second task

$ forgetist list --ctime=+2
bd0888b5c8172bbe418736b952d5d50d277ce7aa
DUE DATE: 7/2/2020
CREATED:  7/1/2020 5:34:55 PM

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
01b307acba4f54f55aafc33bb06bbbf6ca803e9a
DUE DATE: 7/1/2020
CREATED:  7/1/2020 5:34:55 PM
DELETED:  7/3/2020 2:28:12 PM

first task

bd0888b5c8172bbe418736b952d5d50d277ce7aa
DUE DATE: 7/2/2020
CREATED:  7/2/2020 4:31:43 PM
DELETED:  7/3/2020 2:28:12 PM

second task

```

## Want pressure?

Set up cron job.

```
$ crontab -e
1 0 * * * forgetist forget --all
```
