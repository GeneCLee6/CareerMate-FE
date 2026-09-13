import LegalLayout, { LegalSection } from "./LegalLayout";

const CONTACT_EMAIL = "genelee.pro@gmail.com";

/**
 * What the product does with personal information.
 *
 * Written from what the code actually does rather than from a template: every
 * claim here is checkable against the two repositories, and a policy that
 * describes a different product is worse than none. Where something is a
 * limitation rather than a promise, it says so.
 *
 * This is not legal advice and has not been reviewed by a lawyer. It is an
 * honest description of a student project's data handling.
 */
const SECTIONS: LegalSection[] = [
    {
        id: "what-we-collect",
        title: "What is collected",
        body: (
            <>
                <p>
                    Only what the product needs to work. There is no profiling,
                    no enrichment from other sources, and nothing collected
                    &ldquo;just in case&rdquo;.
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>Information</th>
                            <th>Why</th>
                            <th>Where it is stored</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Email address</td>
                            <td>
                                To create your account and send verification
                                codes
                            </td>
                            <td>MongoDB Atlas</td>
                        </tr>
                        <tr>
                            <td>Name and display name</td>
                            <td>
                                To address you, and as context for the assistant
                            </td>
                            <td>MongoDB Atlas</td>
                        </tr>
                        <tr>
                            <td>Password</td>
                            <td>To sign you in</td>
                            <td>
                                MongoDB Atlas, hashed with bcrypt. The plain
                                password is never stored and cannot be
                                recovered — only reset
                            </td>
                        </tr>
                        <tr>
                            <td>Role, field and goal</td>
                            <td>
                                So the assistant does not re-ask what you
                                already told it
                            </td>
                            <td>MongoDB Atlas</td>
                        </tr>
                        <tr>
                            <td>Resume files (PDF)</td>
                            <td>
                                So the assistant can read and discuss your
                                resume
                            </td>
                            <td>
                                Amazon S3. The text extracted from the file is
                                stored in MongoDB Atlas
                            </td>
                        </tr>
                        <tr>
                            <td>Profile photo</td>
                            <td>Shown in the app</td>
                            <td>Amazon S3</td>
                        </tr>
                        <tr>
                            <td>Your conversations</td>
                            <td>So they are still there when you come back</td>
                            <td>MongoDB Atlas</td>
                        </tr>
                    </tbody>
                </table>
            </>
        ),
    },
    {
        id: "who-else-sees-it",
        title: "Who else sees it",
        body: (
            <>
                <p>
                    Three services process data on this product&apos;s behalf.
                    Nothing is sold, and nothing is shared with anyone else.
                </p>
                <ul>
                    <li>
                        <strong>Anthropic (Claude)</strong> — receives your
                        messages, your profile fields, and the text of your
                        resumes, because that is what the assistant reads in
                        order to reply. It does not receive your email address
                        or your password.
                    </li>
                    <li>
                        <strong>Brevo</strong> — receives your email address and
                        name, to deliver verification and password-reset codes.
                    </li>
                    <li>
                        <strong>Amazon Web Services (S3)</strong> — stores
                        uploaded files.
                    </li>
                </ul>
                <p>
                    Files you attach to a chat message are{" "}
                    <strong>not stored</strong>. They are sent to Anthropic for
                    that one message and then discarded; only the filename is
                    kept, so the conversation still makes sense when you read it
                    back.
                </p>
            </>
        ),
    },
    {
        id: "deleting-your-data",
        title: "What you can delete, and how",
        body: (
            <>
                <ul>
                    <li>
                        <strong>A single conversation</strong> — the
                        &ldquo;Delete this conversation&rdquo; button on the
                        assistant screen.
                    </li>
                    <li>
                        <strong>All conversations</strong> — Settings → Account
                        &amp; Security → Delete all chat history. This removes
                        every message, including conversations the assistant
                        screen does not open.
                    </li>
                    <li>
                        <strong>A resume</strong> — the delete control beside it
                        in the resume panel. This removes both the file and the
                        text extracted from it.
                    </li>
                </ul>
                <p>
                    <strong>A limitation worth stating:</strong> there is
                    currently no self-service way to delete your entire account.
                    If you want it removed, email the address at the bottom of
                    this page and it will be deleted along with everything
                    attached to it.
                </p>
            </>
        ),
    },
    {
        id: "how-long",
        title: "How long it is kept",
        body: (
            <p>
                Until you delete it. There is no automatic expiry, and nothing
                is removed on a schedule.
            </p>
        ),
    },
    {
        id: "security",
        title: "Security",
        body: (
            <>
                <ul>
                    <li>
                        Passwords are hashed with bcrypt and are never stored in
                        plain text.
                    </li>
                    <li>
                        Verification and password-reset codes are also stored
                        hashed, expire after 10 minutes, and are limited to five
                        attempts.
                    </li>
                    <li>Traffic is served over HTTPS.</li>
                    <li>
                        You can only ever reach your own data: every request is
                        checked against the account that made it.
                    </li>
                </ul>
                <p>
                    This is a student project. It has not had a security audit,
                    and you should not upload anything you would be
                    uncomfortable having on a small project&apos;s
                    infrastructure.
                </p>
            </>
        ),
    },
    {
        id: "cookies",
        title: "Cookies and tracking",
        body: (
            <p>
                There are none. No analytics, no advertising, no third-party
                trackers. Your sign-in session is kept in your browser&apos;s
                own storage — in <code>localStorage</code> if you ticked
                &ldquo;Remember me&rdquo;, otherwise only until you close the
                tab.
            </p>
        ),
    },
];

const Privacy = () => (
    <LegalLayout
        eyebrow="Privacy"
        title="Privacy Policy"
        summary={
            <>
                CareerMate AI is a student project built as part of the JR
                Academy AI Engineering program. It is not a commercial service.
                This page describes exactly what happens to the information you
                give it — written from the code, not from a template.
            </>
        }
        updated="13 September 2026"
        sections={SECTIONS}
        contactEmail={CONTACT_EMAIL}
    />
);

export default Privacy;
